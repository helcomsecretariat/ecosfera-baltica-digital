import * as THREE from "three";
import { useMemo, forwardRef } from "react";
import { extend } from "@react-three/fiber";

interface RoundedRectangleGeometryProps {
  args: [width: number, height: number, radius: number, depth: number];
}

class RoundedRectGeometry extends THREE.ExtrudeGeometry {
  constructor(width: number, height: number, radius: number, depth: number) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + radius, height / 2);
    shape.lineTo(width / 2 - radius, height / 2);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);
    shape.lineTo(width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2);
    shape.lineTo(-width / 2 + radius, -height / 2);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius);
    shape.lineTo(-width / 2, height / 2 - radius);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.11,
      curveSegments: 6,
    };

    super(shape, extrudeSettings);

    // Manually set UVs for the top faces
    const uvArray = [];
    const vertices = this.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 9) {
      // Extract vertex positions
      const x1 = vertices[i],
        y1 = vertices[i + 1];
      const x2 = vertices[i + 3],
        y2 = vertices[i + 4];
      const x3 = vertices[i + 6],
        y3 = vertices[i + 7];
      // Map positions to UV coordinates (flipping V coordinate)
      uvArray.push(
        (x1 + width / 2) / width,
        (y1 + height / 2) / height,
        (x2 + width / 2) / width,
        (y2 + height / 2) / height,
        (x3 + width / 2) / width,
        (y3 + height / 2) / height,
      );
    }
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvArray, 2));
  }
}

// Register the custom geometry in the extend function
extend({ roundedRectGeometry: RoundedRectGeometry });

const RoundedRectangleGeometry = forwardRef<THREE.BufferGeometry, RoundedRectangleGeometryProps>(({ args }, ref) => {
  const [width, height, radius, depth] = args;
  const geom = useMemo(() => new RoundedRectGeometry(width, height, radius, depth), [width, height, radius, depth]);
  return <primitive ref={ref} object={geom} attach="geometry" />;
});

export { RoundedRectangleGeometry };
