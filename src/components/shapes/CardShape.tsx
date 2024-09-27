import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, ColorManagement } from "three";

interface RoundedRectangleProps {
  width?: number;
  height?: number;
  radius?: number;
  depth?: number;
  texturePath: string;
}

const RoundedRectangle: React.FC<RoundedRectangleProps> = ({
  width = 2,
  height = 1,
  radius = 2,
  depth = 0.01,
  texturePath,
}) => {
  const { gl } = useThree();
  const texture = useTexture(texturePath);

  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;
  texture.colorSpace = SRGBColorSpace;

  const shape = useMemo(() => {
    const newShape = new THREE.Shape();
    newShape.moveTo(-width / 2 + radius, height / 2);
    newShape.lineTo(width / 2 - radius, height / 2);
    newShape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);
    newShape.lineTo(width / 2, -height / 2 + radius);
    newShape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2);
    newShape.lineTo(-width / 2 + radius, -height / 2);
    newShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius);
    newShape.lineTo(-width / 2, height / 2 - radius);
    newShape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2);
    return newShape;
  }, [width, height, radius]);

  const geometry = useMemo(() => {
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.11,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Manually set UVs for the top faces
    const uvArray = [];
    const vertices = geometry.attributes.position.array;
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
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvArray, 2));

    return geometry;
  }, [shape, depth, width, height]);

  const materials = useMemo(() => {
    return [
      new THREE.MeshBasicMaterial({ map: texture }), // Material for the top face with texture
      new THREE.MeshBasicMaterial({ color: "green" }), // Material for the side edges
    ];
  }, [texture]);

  return <mesh geometry={geometry} material={materials} />;
};

export default RoundedRectangle;
