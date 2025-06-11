<!-- src/components/ThreeScene.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { theme, createColorPalette } from "../stores/theme";

  // ============================================================
  // CONFIG AND CONSTANTS
  // ============================================================
  // Get initial colors for startup
  const initialColors = createColorPalette();
  
  // Set up palette - we'll make it reactive
  let PALETTE = {
    background: initialColors.background.hex,
    text: initialColors.text.hex,
    accent: initialColors.accent.hex,
    secondary: initialColors.secondary.hex
  };
  
  // Update palette when theme changes
  $: if ($theme && $theme.colors) {
    PALETTE = {
      background: $theme.colors.background.hex,
      text: $theme.colors.text.hex,
      accent: $theme.colors.accent.hex,
      secondary: $theme.colors.secondary.hex
    };
    
    // If scene is already initialized, update colors
    if (scene) {
      updateSceneColors();
    }
  }
  
  // Function to update scene colors if theme changes
  function updateSceneColors() {
    if (!scene) return;
    
    // Update scene background
    scene.background = new THREE.Color(COLORS.background.top);
    scene.fog = new THREE.FogExp2(COLORS.background.top, VISUAL.fogDensity);
    
    // Update materials if they exist
    if (materials.clouds) {
      materials.clouds.color.set(COLORS.objects.clouds);
      materials.clouds.emissive.set(COLORS.objects.clouds);
    }
    
    if (materials.mouseBody) {
      materials.mouseBody.color.set(COLORS.objects.mouseBody);
      materials.mouseBody.emissive.set(COLORS.objects.mouseEmissive);
    }
    
    if (materials.halo) {
      materials.halo.color.set(COLORS.objects.mouseEmissive);
    }
  }
  
  // Expanded color scheme using the palette strategically
  $: COLORS = {
    // Scene background elements
    background: {
      top: PALETTE.background,
      bottom: 0x404BB4,  // Deep blue for a calm ocean-like feel.
      ambient: 0xffe986, // Warm, sunlit yellow — glow and vibrancy
    },

    // Physical object materials
    objects: {
      clouds: PALETTE.accent,
      physicsBody: 0xFFFFFF,  // Crisp pure white
      physicsEmissive: null,  // No emissive for better contrast
      wireframe: 0x2E8B57,    // Deep green for subtle structure
      mouseBody: PALETTE.accent,
      mouseEmissive: PALETTE.accent,
    },

    // Scene lighting configuration - beach day lighting colors
    lights: {
      directional: 0xFFFDF0, // Strong, warm sunlight
      fill: 0xFFF6DA,        // Balanced fill light with golden warmth
      hemisphere: {
        sky: 0xFFFFF7,       // Clean, warm white sky dome
        ground: PALETTE.secondary,
      },
      rim: 0xFFF4B2,         // Brighter, slightly peachy rim light for warmth
      mouse: PALETTE.accent
    },
  };


  // Physics simulation parameters
  const PHYSICS = {
    numBodies: 35, // number of bodies
    bodyRange: 8.5, // distribution radius for better visibility
    bodyDensityMultiplier: 26.5, // Mass calculation factor
    forceMultiplier: -0.01, // Centripetal force strength
    mouseSize: 0.2, // Mouse interaction sphere radius
    mouseSensitivity: 4, // Mouse movement amplification
  };

  // Visual rendering parameters
  const VISUAL = {
    cloudCount: 10, // Number of cloud objects
    cloudScale: 0.25, // Size multiplier for clouds
    physicsScale: 1.5, // Size multiplier for physics container
    bloomParams: {
      strength: 0.25, // Drastically reduced bloom intensity
      radius: 0.4, // Tighter radius for more defined effect
      threshold: 1.8, // Much higher threshold to only affect brightest parts
    },
    fogDensity: 0.00000002, // Significantly reduced fog for beach day clarity
    clouds: {
      minDistance: -100, // Nearest z-position before reset
      maxDistance: 250,  // Furthest z-position for spawning
      minX: -35,        // Leftmost position
      maxX: 35,         // Rightmost position
      minY: -10,        // Lowest position
      maxY: 30,         // Highest position
      fogStartDistance: -100, // Fog effect start distance
      fogEndDistance: -150,   // Fog effect maximum distance
      speedMin: 0.5,          // Minimum movement speed
      speedMax: 0.9,          // Maximum movement speed
      // Define exclusion zone - ensure clouds don't appear in central physics area
      exclusionZoneRadius: PHYSICS.bodyRange * 3, // Making it slightly larger than physics range for visual clarity
    }
  };

  // Camera configuration
  const CAMERA = {
    fov: 75, // Field of view in degrees
    near: 0.1, // Near clipping plane
    far: 1000, // Far clipping plane
    position: new THREE.Vector3(0, 0, 8), // Initial position
    target: new THREE.Vector3(0, 0, 0), // Look-at point
    controls: {
      minDistance: 8, // Closest zoom distance
      maxDistance: 12, // Furthest zoom distance
      dampingFactor: 0.05, // Inertia effect strength
    },
  };

  // Center reference point
  const sceneMiddle = new THREE.Vector3(0, 0, 0);

  // Random number generators
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const randomFloat = (min, max) => 
    min + Math.random() * (max - min);

  // ============================================================
  // COMPONENT STATE
  // ============================================================

  // DOM element for the canvas
  let container;

  // Core scene elements
  let scene, camera, renderer, controls;
  let composer;
  let world;
  let physicsContainer;
  let bodies = [];
  let clouds = [];
  let mouseBall;
  let materials = {};
  let isMouseActive = false;

  // Runtime state
  let isBrowser = false;
  let animationFrame;
  let startTime;
  let mousePos = new THREE.Vector2();

  // Scroll handling
  let scrollProgress = 0;
  let isTransitionComplete = false;
  const TRANSITION_THRESHOLD = 1; // When scrollProgress = 1, transition is complete

  // ============================================================
  // LIFECYCLE HOOKS
  // ============================================================

  onMount(async () => {
    isBrowser = true;
    startTime = performance.now() / 1000;

    try {
      // Load Rapier physics engine
      const RAPIER = await import(
        "https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2"
      );
      await RAPIER.init();

      // Initialize scene and start animation
      initScene(RAPIER);
      animate();

      // Add event listeners
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("scroll", handleScroll);
      
      // Dispatch event to signal ThreeScene is loaded and ready
      window.dispatchEvent(new CustomEvent('threeSceneLoaded'));
    } catch (error) {
      console.error("Failed to initialize scene:", error);
      
      // Even if there was an error, signal that loading is complete
      // so the user isn't stuck on the loading screen
      window.dispatchEvent(new CustomEvent('threeSceneLoaded'));
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrame);
      if (renderer) renderer.dispose();
    };
  });

  onDestroy(() => {
    if (!isBrowser) return;

    cancelAnimationFrame(animationFrame);
    window.removeEventListener("scroll", handleScroll);

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement = null;
      renderer = null;
    }

    if (scene) {
      scene.clear();
      scene = null;
    }

    camera = null;
    controls = null;
    bodies = [];
    clouds = [];
    mouseBall = null;
    world = null;
    physicsContainer = null;
    materials = {};
  });

  // ============================================================
  // SCENE INITIALIZATION
  // ============================================================

  function initScene(RAPIER) {
    if (!isBrowser) return;

    // Initialize core scene components
    initSceneCore();

    // Initialize materials before objects that use them
    initMaterials();

    // Create scene elements
    initLighting();
    initEnvironment();
    initClouds();
    initPhysics(RAPIER);

    // Update controls once all is set up
    controls.update();
  }

  function initSceneCore() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Create scene with minimal fog for beach day clarity
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(COLORS.background.top, VISUAL.fogDensity);
    
    // Set explicit background color
    scene.background = new THREE.Color(COLORS.background.top);

    // Configure perspective camera
    camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      w / h,
      CAMERA.near,
      CAMERA.far
    );
    camera.position.copy(CAMERA.position);

    // Configure WebGL renderer with enhanced shadows
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: container,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(COLORS.background.top, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Configure orbit controls for camera
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = CAMERA.controls.dampingFactor;
    controls.minDistance = CAMERA.controls.minDistance;
    controls.maxDistance = CAMERA.controls.maxDistance;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.mouseButtons = {
      MIDDLE: THREE.MOUSE.DOLLY,
      LEFT: THREE.MOUSE.ROTATE,
      RIGHT: null,
    };
    controls.target.copy(CAMERA.target);

    // Setup post-processing pipeline with minimized bloom
    setupPostProcessing(w, h);
  }

  function initMaterials() {
    // Cloud material with enhanced emissive glow
    materials.clouds = new THREE.MeshPhongMaterial({
      color: COLORS.objects.clouds,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
      shininess: 20,
      specular: 0x666666,
      emissive: COLORS.objects.clouds,
      emissiveIntensity: 0.2,
    });
    
    // Physics body material - crisp white with strong specular highlights
    materials.physicsBody = new THREE.MeshStandardMaterial({
      color: COLORS.objects.physicsBody,
      flatShading: false,
      transparent: true,
      opacity: 0.75,
      metalness: 0.15,  // Just enough for good reflections
      roughness: 0.2,   // Lower roughness for beach day shine
      emissive: null,   // No emissive to maintain contrast
    });
    
    // Wireframe overlay material with higher contrast
    materials.wireframe = new THREE.MeshBasicMaterial({
      color: COLORS.objects.wireframe,
      wireframe: true,
      transparent: true,
      opacity: 0.95,  // Increased opacity for better definition
    });
    
    // Enhanced material with faint glow effect
    materials.mouseBody = new THREE.MeshPhysicalMaterial({
      color: COLORS.objects.mouseBody,
      emissive: COLORS.objects.mouseEmissive,
      emissiveIntensity: 0.9,
      metalness: 0.4,
      roughness: 0.7,
      clearcoat: 0.7,
      transparent: false,
      opacity: 0.9,
      vertexColors: true
    });
    
    // Halo material for mouse
    materials.halo = new THREE.MeshBasicMaterial({
      color: COLORS.objects.mouseEmissive,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    
    // Create a simple texture for the floor
    const textureSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const ctx = canvas.getContext('2d');

    // Fill with base color
    ctx.fillStyle = '#404BB4';
    ctx.fillRect(0, 0, textureSize, textureSize);

    // Add some subtle texture
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * textureSize;
      const y = Math.random() * textureSize;
      const size = 1 + Math.random() * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

    // Create texture from canvas
    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5, 5);

    // Floor material with texture
    materials.floor = new THREE.MeshStandardMaterial({
      color: COLORS.background.bottom,
      map: floorTexture,
      roughness: 0.7,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    // Background plane material
    materials.background = new THREE.MeshBasicMaterial({
      color: COLORS.background.top,
      transparent: true,
      opacity: 0.7,
    });
  }

  function setupPostProcessing(w, h) {
    // Scene render pass
    const renderPass = new RenderPass(scene, camera);
    
    // Optional: completely remove bloom pass for maximum clarity
    // composer = new EffectComposer(renderer);
    // composer.addPass(renderPass);

    // Alternative: keep bloom but drastically reduce its intensity
    /*
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      VISUAL.bloomParams.strength, // Very low strength
      VISUAL.bloomParams.radius,   // Tight radius
      VISUAL.bloomParams.threshold // High threshold - only affects very bright parts
    );
    */
    
    // Assemble post-processing pipeline
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    // composer.addPass(bloomPass); // Comment this line to disable bloom entirely
  }

  // ============================================================
  // SCENE ELEMENTS CREATION
  // ============================================================

  function initLighting() {
    // Primary directional light - bright sun for beach day
    const directional = new THREE.DirectionalLight(
      COLORS.lights.directional,
      1.2 // Higher intensity for beach sunlight
    );
    directional.position.set(30, 80, 30); // More overhead position like midday sun
    directional.castShadow = true;
    
    // Improved shadow quality with sharper shadows
    directional.shadow.mapSize.width = 512;
    directional.shadow.mapSize.height = 512;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 100;
    directional.shadow.bias = -0.0002; 
    
    scene.add(directional);

    // Secondary fill light with blue tint for sky reflections
    const fillLight = new THREE.DirectionalLight(COLORS.lights.fill, 0.3);
    fillLight.position.set(-30, 60, 40);
    scene.add(fillLight);

    // Add front fill for better visibility
    const frontFill = new THREE.DirectionalLight(COLORS.lights.directional, 0.15);
    frontFill.position.set(0, 5, 30);
    scene.add(frontFill);

    // Minimal ambient light to preserve shadow contrast
    const ambient = new THREE.AmbientLight(COLORS.background.ambient, 0.5);
    scene.add(ambient);

    // Hemisphere light - blue sky above, warm orange below
    const hemiLight = new THREE.HemisphereLight(
      COLORS.lights.hemisphere.sky,
      COLORS.lights.hemisphere.ground,
      0.4 // Strong contribution for beach lighting
    );
    scene.add(hemiLight);
    
    // White rim light for edge definition
    const rimLight = new THREE.DirectionalLight(
      COLORS.lights.rim,
      0.2
    );
    rimLight.position.set(-10, 3, -20);
    scene.add(rimLight);
  }

  function initEnvironment() {
    // Floor plane (large ground surface)
    const floorGeometry = new THREE.PlaneGeometry(2000, 1000);
    const floor = new THREE.Mesh(floorGeometry, materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    floor.position.z = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Background plane (distant backdrop)
    const bgGeometry = new THREE.PlaneGeometry(2000, 1000);
    const bgPlane = new THREE.Mesh(bgGeometry, materials.background);
    bgPlane.position.z = -50;
    bgPlane.position.y = 0;
    scene.add(bgPlane);
  }

  function initClouds() {
    clouds = [];

    for (let i = 0; i < VISUAL.cloudCount; i++) {
      // Generate a position for the cloud outside the exclusion zone
      const cloudPosition = generateCloudPositionOutsideExclusionZone();
      
      const cloud = createCloud({
        delay: i * 0.3,
        x: cloudPosition.x,
        y: cloudPosition.y,
        // Position clouds at different depths
        z: randomInt(-70, VISUAL.clouds.maxDistance),
      });

      if (cloud.mesh) {
        cloud.mesh.scale.multiplyScalar(VISUAL.cloudScale);
        clouds.push(cloud);
        scene.add(cloud.mesh);
      }
    }
  }
  
  // New function to generate cloud positions outside the exclusion zone
  function generateCloudPositionOutsideExclusionZone() {
    const exclusionRadius = VISUAL.clouds.exclusionZoneRadius;
    let x, y;
    let isInExclusionZone = true;
    
    // Keep generating positions until we find one outside the exclusion zone
    while (isInExclusionZone) {
      x = randomInt(VISUAL.clouds.minX, VISUAL.clouds.maxX);
      y = randomInt(VISUAL.clouds.minY, VISUAL.clouds.maxY);
      
      // Check if this position is outside the exclusion zone
      // Using distance formula: sqrt(x² + y²) > exclusionRadius
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      isInExclusionZone = distanceFromCenter < exclusionRadius;
    }
    
    return { x, y };
  }

  function initPhysics(RAPIER) {
    // Create zero-gravity physics world
    const gravity = { x: 0.0, y: 0, z: 0.0 };
    world = new RAPIER.World(gravity);

    // Create container for physics objects
    physicsContainer = new THREE.Group();
    scene.add(physicsContainer);

    // Scale and position the container
    physicsContainer.position.set(0, 0, 0);
    physicsContainer.scale.setScalar(VISUAL.physicsScale);

    // Populate with physics bodies
    createPhysicsBodies(RAPIER, physicsContainer);

    // Create mouse-controlled interactive ball
    createMouseBall(RAPIER, physicsContainer);
  }

  // ============================================================
  // PHYSICS AND OBJECTS CREATION
  // ============================================================

  function createPhysicsBodies(RAPIER, container) {
    for (let i = 0; i < PHYSICS.numBodies; i++) {
      const body = createPhysicsBody(RAPIER, world);
      bodies.push(body);
      container.add(body.mesh);
    }
  }
  
  function createPhysicsBody(RAPIER, world) {
    const size = 0.2 + Math.random() * 0.1;
    const range = PHYSICS.bodyRange;
    const density = size * PHYSICS.bodyDensityMultiplier;

    // Randomize starting position
    let x = Math.random() * range - range * 0.5;
    let y = Math.random() * range - range * 0.5;
    let z = Math.random() * range - range * 0.5;

    // Create physics rigid body
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, z)
      .setLinearDamping(0.5)  // Affects linear movement
      .setAngularDamping(0.9); // Affects rotations
    let rigid = world.createRigidBody(rigidBodyDesc);

    // Create spherical collider - keep this the same for physics
    let colliderDesc = RAPIER.ColliderDesc.ball(size)
      .setDensity(density)
      .setRestitution(0.05) // Lower values make collisions less bouncy
      .setFriction(2.1) // Higher values create more friction
    world.createCollider(colliderDesc, rigid);

    // Create a low-poly sphere with varying detail levels
    // The detail level (subdivisions) determines how faceted/low-poly the sphere looks
    // Random number from 0-2 for polyhedron detail level
    const minDetailLevel = 2;  // Minimum detail (0 = very low poly, 20 faces)
    const maxDetailLevel = 6;  // Maximum detail (2 = 320 faces)

    // Random detail level within the specified range
    const detailLevel = minDetailLevel + Math.floor(Math.random() * (maxDetailLevel - minDetailLevel + 1));
    
    // Create geometry with appropriate detail level
    const geometry = new THREE.IcosahedronGeometry(size, detailLevel);
    
    // Create the mesh with the low-poly geometry
    const mesh = new THREE.Mesh(geometry, materials.physicsBody);
    
    // Configure shadow casting
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add wireframe overlay
    const wireMesh = new THREE.Mesh(geometry, materials.wireframe);
    wireMesh.scale.setScalar(1.005);
    mesh.add(wireMesh);
    
    // Unique rotation rates
    const rotationRates = {
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.006
    };

    // Physics update function
    function update() {
      rigid.resetForces(true);
      let { x, y, z } = rigid.translation();

      // Apply centripetal force
      let pos = new THREE.Vector3(x, y, z);
      let dir = pos.clone().sub(sceneMiddle).normalize();
      rigid.addForce(dir.multiplyScalar(PHYSICS.forceMultiplier), true);

      // Update visual position
      mesh.position.set(x, y, z);
      
      // Add subtle rotation with unique rates
      mesh.rotation.x += rotationRates.x;
      mesh.rotation.y += rotationRates.y;
    }

    return { mesh, rigid, update };
  }

  function createMouseBall(RAPIER, container) {
    const mouseSize = PHYSICS.mouseSize;

    // Create efficient octahedron geometry
    const geometry = new THREE.OctahedronGeometry(mouseSize, 0);
    
    // Enhanced material with faint glow effect
    materials.mouseBody = new THREE.MeshPhysicalMaterial({
      color: COLORS.objects.mouseBody,
      emissive: COLORS.objects.mouseEmissive,
      emissiveIntensity: 0.09,
      metalness: 0.4,
      roughness: 0.7,
      clearcoat: 0.7,
      transparent: false,
      opacity: 0.9,
      vertexColors: true
    });
    
    // Procedural texture generation (your existing code)
    const colors = [];
    const vertices = geometry.attributes.position;
    const vertexCount = vertices.count;
    
    const baseColor = new THREE.Color(COLORS.objects.mouseBody);
    const accentColor = new THREE.Color(COLORS.objects.mouseEmissive);
    const finalColor = new THREE.Color();
    
    for (let i = 0; i < vertexCount; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);
      
      const noise = (Math.sin(x*5 + y*7 + z*9) * 0.5 + 0.5);
      const mixFactor = 0.6 + 0.4 * noise;
      
      finalColor.copy(baseColor).lerp(accentColor, mixFactor);
      colors.push(finalColor.r, finalColor.g, finalColor.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const mouseMesh = new THREE.Mesh(geometry, materials.mouseBody);
    mouseMesh.castShadow = true;
    
    // Create lights
    const mouseLight = new THREE.PointLight(COLORS.lights.mouse, 8, 10);
    mouseLight.castShadow = true;
    mouseLight.shadow.mapSize.width = 256;
    mouseLight.shadow.mapSize.height = 256;
    mouseLight.shadow.camera.near = 0.1;
    mouseLight.shadow.camera.far = 10;

    const oppositeLight = new THREE.PointLight(
      new THREE.Color(COLORS.lights.mouse).offsetHSL(0.05, 0, 0),
      7, 10
    );
    oppositeLight.position.set(0, 0, -0.2);

    // REFINED HALO IMPLEMENTATION
    // Create a multi-layered halo effect for better visual depth and clarity
    const createHaloLayer = (size, opacity, segments = 12) => {
      const material = new THREE.MeshBasicMaterial({
        color: COLORS.objects.mouseEmissive,
        transparent: true,
        opacity: opacity,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false // Prevents z-fighting between layers
      });
      
      const geo = new THREE.SphereGeometry(size, segments, segments);
      return new THREE.Mesh(geo, material);
    };
    
    // Create halo container to manage all halo layers
    const haloContainer = new THREE.Group();
    haloContainer.position.set(0, 0, 0); // Ensure perfect centering
    
    // Inner halo layer (strong, close to the core)
    const innerHalo = createHaloLayer(mouseSize * 1., 0.15, 16);
    
    // Middle halo layer
    const middleHalo = createHaloLayer(mouseSize * 1.25, 0.08, 14);
    
    // Outer halo layer (subtle, larger radius)
    const outerHalo = createHaloLayer(mouseSize * 1.5, 0.04, 12);
    
    // Add all halo layers to the container
    haloContainer.add(innerHalo, middleHalo, outerHalo);
    
    // Add halo container to the mouse mesh
    mouseMesh.add(haloContainer);
    
    // Add lights to mouse mesh
    mouseMesh.add(mouseLight);
    mouseMesh.add(oppositeLight);
    
    // Physics setup (your existing code)
    let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0);
    let mouseRigid = world.createRigidBody(bodyDesc);
    let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 1.6);
    world.createCollider(dynamicCollider, mouseRigid);
    
    // Update function
    function update(mousePos) {
      if (!mouseRigid || !mouseRigid.translation) return;
      
      if (!isMouseActive) {
        mouseRigid.setTranslation({ x: 0, y: 0, z: 0 });
        mouseMesh.position.set(0, 0, 0);
        return;
      }
      
      // Update physics position
      mouseRigid.setTranslation({ 
        x: mousePos.x * PHYSICS.mouseSensitivity, 
        y: mousePos.y * PHYSICS.mouseSensitivity, 
        z: 0 
      });
      
      // Update visual position
      const { x, y, z } = mouseRigid.translation();
      mouseMesh.position.set(x, y, z);
      
      // Calculate time for animations
      const time = performance.now() * 0.001;
      
      // Smooth pulsing effect using sine wave
      const pulseFactor = Math.sin(time * 1.2) * 0.5 + 0.5;
      
      // Apply pulsing to lights
      mouseLight.intensity = 6 + pulseFactor * 4;
      oppositeLight.intensity = 5 + pulseFactor * 4;
      
      // Apply breathing effect to halo layers with slight phase differences
      const baseScale = 0.95 + pulseFactor * 0.1;
      
      // Scale each halo layer slightly differently for more organic feel
      innerHalo.scale.setScalar(baseScale);
      middleHalo.scale.setScalar(baseScale * (1.0 + Math.sin(time * 1.5) * 0.03));
      outerHalo.scale.setScalar(baseScale * (1.0 + Math.sin(time * 0.9) * 0.05));
      
      // Rotate the mouse object
      mouseMesh.rotation.y += 0.0025;
    }
    
    container.add(mouseMesh);
    mouseBall = { 
      mesh: mouseMesh, 
      rigid: mouseRigid, 
      update,
      lights: [mouseLight, oppositeLight],
      haloLayers: [innerHalo, middleHalo, outerHalo]  // Track halo references
    };
  }

  function createCloud(config = {}) {
    if (!materials.clouds) return { mesh: null };

    const mesh = new THREE.Group();

    // Create composite cloud shape
    const cloudGeometry = createCloudGeometry();
    mesh.add(cloudGeometry);

    // Position cloud in 3D space
    mesh.position.x = config.x !== undefined ? config.x : 
      randomInt(VISUAL.clouds.minX, VISUAL.clouds.maxX);

    mesh.position.y = config.y !== undefined ? config.y : 
      randomInt(VISUAL.clouds.minY, VISUAL.clouds.maxY);

    mesh.position.z = config.z !== undefined ? config.z : 
      randomInt(0, VISUAL.clouds.maxDistance);

    // Random rotation for variety
    mesh.rotation.z = (Math.random() - 0.5) * 0.2;

    // Track materials for opacity management
    const originalMaterials = [];
    mesh.traverse(child => {
      if (child.isMesh && child.material) {
        originalMaterials.push({
          mesh: child,
          originalOpacity: child.material.opacity
        });
      }
    });

    // Animation parameters
    const animationData = {
      speed: randomFloat(VISUAL.clouds.speedMin, VISUAL.clouds.speedMax),
      delay: config.delay || 0,
      verticalSpeed: (Math.random() - 0.5) * 0.1,
      verticalAmplitude: 2 + Math.random() * 3,
      verticalOffset: Math.random() * Math.PI * 2,
      originalY: mesh.position.y,
      originalMaterials: originalMaterials
    };

    // Cloud movement update function
    function update(elapsed) {
      if (elapsed < animationData.delay) return;

      // Forward movement toward camera
      mesh.position.z -= animationData.speed * 0.05;

      // Sinusoidal vertical movement
      mesh.position.y =
        animationData.originalY +
        Math.sin(
          elapsed * animationData.verticalSpeed + animationData.verticalOffset
        ) *
          animationData.verticalAmplitude;

      // Fade out when entering fog zone
      if (mesh.position.z < VISUAL.clouds.fogStartDistance) {
        // Calculate fog intensity
        const fogDepth = (mesh.position.z - VISUAL.clouds.fogStartDistance) / 
                        (VISUAL.clouds.fogEndDistance - VISUAL.clouds.fogStartDistance);
        
        // Ensure opacity doesn't go negative
        const fogFactor = Math.max(0, 1 + fogDepth);
        
        // Apply reduced opacity
        animationData.originalMaterials.forEach(item => {
          item.mesh.material.opacity = item.originalOpacity * fogFactor;
        });
      } else {
        // Reset opacity outside fog zone
        animationData.originalMaterials.forEach(item => {
          item.mesh.material.opacity = item.originalOpacity;
        });
      }

      // Recycle cloud when it passes minimum distance
      if (mesh.position.z < VISUAL.clouds.minDistance) {
        // Move to far distance
        mesh.position.z = VISUAL.clouds.maxDistance;
        
        // Randomize horizontal position outside exclusion zone
        const newPosition = generateCloudPositionOutsideExclusionZone();
        mesh.position.x = newPosition.x;
        
        // Randomize vertical position
        animationData.originalY = newPosition.y;
        mesh.position.y = animationData.originalY;
        
        // Reset opacity values
        animationData.originalMaterials.forEach(item => {
          item.mesh.material.opacity = item.originalOpacity;
        });
      }
    }

    return { mesh, update };
  }

  function createCloudGeometry() {
    const group = new THREE.Group();

    // Base geometry for cloud components
    const cloudGeo = new THREE.SphereGeometry(5, 7, 7);

    // Main central cloud mass
    const cloud1 = new THREE.Mesh(cloudGeo, materials.clouds.clone());
    cloud1.scale.set(1, 0.7, 1);

    // Right side cloud mass
    const cloud2 = new THREE.Mesh(cloudGeo, materials.clouds.clone());
    cloud2.material.opacity = 0.8;
    cloud2.scale.set(0.6, 0.4, 0.9);
    cloud2.position.set(5, -1.5, 2);

    // Left side cloud mass
    const cloud3 = new THREE.Mesh(cloudGeo, materials.clouds.clone());
    cloud3.material.opacity = 0.72;
    cloud3.scale.set(0.8, 0.5, 0.7);
    cloud3.position.set(-5.5, -2, -1);

    // Assemble cloud parts
    group.add(cloud1, cloud2, cloud3);

    // Apply random size variation
    const scale = 1.2 + Math.random();
    group.scale.set(scale, scale * 0.65, scale);

    // Apply random tilt for variety
    group.rotation.x = (Math.random() - 0.5) * 0.2;

    return group;
  }

  // ============================================================
  // EVENT HANDLERS AND ANIMATION
  // ============================================================

  function onResize() {
    if (!camera || !renderer) return;

    // Update aspect ratio for responsive rendering
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update render dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update post-processing dimensions
    if (composer) {
      composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  function handleMouseMove(evt) {
    // Activate mouse tracking on first movement
    if (!isMouseActive) {
      isMouseActive = true;
    }

    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    mousePos.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(evt.clientY / window.innerHeight) * 2 + 1;
  }

  // Add this function to handle scroll events
  function handleScroll() {
    // Calculate scroll progress (0 to 1)
    const scrollMax = window.innerHeight; // Use one viewport height for the zoom effect
    const currentScroll = Math.min(window.scrollY, scrollMax);
    scrollProgress = currentScroll / scrollMax;
    
    // Update camera zoom based on scroll position
    if (camera && controls) {
      // Map scrollProgress (0-1) to camera distance (minDistance to maxDistance)
      const minDist = CAMERA.controls.minDistance;
      const maxDist = CAMERA.controls.maxDistance;
      const newDistance = minDist + (scrollProgress * (maxDist - minDist));
      
      // Set the camera distance
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      camera.position.copy(controls.target).add(dir.multiplyScalar(newDistance));
      
      // Disable user control during this transition
      controls.enabled = scrollProgress >= TRANSITION_THRESHOLD;
      
      // Signal when transition is complete
      if (scrollProgress >= TRANSITION_THRESHOLD && !isTransitionComplete) {
        isTransitionComplete = true;
      } else if (scrollProgress < TRANSITION_THRESHOLD && isTransitionComplete) {
        isTransitionComplete = false;
      }
    }
  }

  function animate() {
    if (!isBrowser || !scene || !camera || !renderer) return;

    // Schedule next animation frame
    animationFrame = requestAnimationFrame(animate);

    // Calculate time since start
    const elapsed = performance.now() / 1000 - startTime;

    // Apply camera inertia
    if (controls) controls.update();

    // Update all scene elements
    updateClouds(elapsed);
    updatePhysics();

    // Perform rendering
    renderScene();
  }

  function updateClouds(elapsed) {
    if (clouds && clouds.length > 0) {
      clouds.forEach((cloud) => {
        if (cloud) cloud.update(elapsed);
      });
    }
  }

  function updatePhysics() {
    // Advance physics simulation
    if (world) {
      world.step();
    }

    // Update cursor interaction ball
    if (mouseBall) {
      mouseBall.update(mousePos);
    }

    // Update all physics-based objects
    if (bodies && bodies.length > 0) {
      bodies.forEach((body) => body.update());
    }
  }

  function renderScene() {
    // Option 1: Use post-processing (with minimal bloom)
    if (composer) {
      composer.render();
    } 
    // Option 2: Skip post-processing for maximum clarity
    else {
      renderer.render(scene, camera);
    }
  }
</script>

<canvas bind:this={container} class="absolute top-0 left-0 w-full h-full z-10 pointer-events-auto"></canvas>