import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function IsometricGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Orthographic Camera for Isometric look
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const d = 8;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    
    // Isometric angle: 
    camera.position.set(20, 20, 20); // Position to look at center
    camera.lookAt(scene.position); // Look at origin (0,0,0)
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Grid Setup
    const gridSize = 14; 
    const cubeSize = 0.9;
    const gap = 0.3;
    const totalSize = cubeSize + gap;
    
    // Create InstancedMesh
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    const fillMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0A0B08, 
      transparent: true,
      opacity: 0.8
    });
    
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0xD4FF3D,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    const count = gridSize * gridSize;
    const fillMesh = new THREE.InstancedMesh(geometry, fillMaterial, count);
    const edgeMesh = new THREE.InstancedMesh(geometry, edgeMaterial, count);
    
    // Position cubes
    const offset = (gridSize * totalSize) / 2 - (totalSize / 2);
    
    const dummy = new THREE.Object3D();
    const targetHeights = new Float32Array(count);
    const currentHeights = new Float32Array(count);
    
    let index = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const px = x * totalSize - offset;
        const pz = z * totalSize - offset;
        
        dummy.position.set(px, 0, pz);
        dummy.updateMatrix();
        
        fillMesh.setMatrixAt(index, dummy.matrix);
        edgeMesh.setMatrixAt(index, dummy.matrix);
        
        targetHeights[index] = 0;
        currentHeights[index] = 0;
        index++;
      }
    }
    
    scene.add(fillMesh);
    scene.add(edgeMesh);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    
    // Invisible plane to catch mouse rays
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    planeGeo.rotateX(-Math.PI / 2);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(plane);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const delta = Math.min(clock.getDelta(), 0.1);
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(plane);
      
      let hitPoint = new THREE.Vector3(-9999, 0, -9999);
      if (intersects.length > 0) {
        hitPoint = intersects[0].point;
      }
      
      const maxRise = 3.5;
      const radius = 4;
      
      let i = 0;
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const px = x * totalSize - offset;
          const pz = z * totalSize - offset;
          
          let dist = 9999;
          if (hitPoint.x !== -9999) {
            const dx = px - hitPoint.x;
            const dz = pz - hitPoint.z;
            dist = Math.sqrt(dx * dx + dz * dz);
          }
          
          if (dist < radius) {
            // Smooth falloff curve
            const normalizedDist = dist / radius;
            targetHeights[i] = maxRise * Math.pow(1 - normalizedDist, 1.5);
          } else {
            targetHeights[i] = 0;
          }
          
          // Idle wave for touch/no mouse (hitPoint.x === -9999)
          if (hitPoint.x === -9999) {
            const time = clock.getElapsedTime() * 0.5;
            targetHeights[i] = (Math.sin(px * 0.4 + time) * Math.cos(pz * 0.4 + time)) * 0.8 + 0.8;
          }
          
          // Smooth Lerp
          currentHeights[i] += (targetHeights[i] - currentHeights[i]) * 8 * delta;
          
          dummy.position.set(px, currentHeights[i], pz);
          dummy.updateMatrix();
          
          fillMesh.setMatrixAt(i, dummy.matrix);
          edgeMesh.setMatrixAt(i, dummy.matrix);
          
          i++;
        }
      }
      
      fillMesh.instanceMatrix.needsUpdate = true;
      edgeMesh.instanceMatrix.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const newAspect = width / height;
      
      camera.left = -d * newAspect;
      camera.right = d * newAspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        containerRef.current.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      fillMaterial.dispose();
      edgeMaterial.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute top-0 right-0 w-full md:w-[60%] h-full pointer-events-auto z-0 overflow-hidden opacity-90"
      style={{ 
        maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%)', 
        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%)' 
      }}
    />
  );
}

