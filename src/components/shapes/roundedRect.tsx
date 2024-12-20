import { Vector2, ExtrudeGeometry, ExtrudeGeometryOptions, Shape, BufferGeometry } from "three";
import { useMemo, forwardRef } from "react";
import { extend } from "@react-three/fiber";

interface RoundedRectangleGeometryProps {
  args: [width: number, height: number, radius: number, depth: number];
}

class RoundedRectGeometry extends ExtrudeGeometry {
  constructor(width: number, height: number, radius: number, depth: number) {
    const shape = new Shape();
    shape.moveTo(-width / 2 + radius, height / 2);
    shape.lineTo(width / 2 - radius, height / 2);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);
    shape.lineTo(width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2);
    shape.lineTo(-width / 2 + radius, -height / 2);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius);
    shape.lineTo(-width / 2, height / 2 - radius);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2);

    const extrudeSettings: ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: false,
      curveSegments: 6,
      UVGenerator: {
        generateTopUV: function (_geometry, vertices, indexA, indexB, indexC) {
          // fixing UV mapping for top/back faces
          const a_x = vertices[indexA * 3];
          const a_y = vertices[indexA * 3 + 1];
          const b_x = vertices[indexB * 3];
          const b_y = vertices[indexB * 3 + 1];
          const c_x = vertices[indexC * 3];
          const c_y = vertices[indexC * 3 + 1];

          return [
            new Vector2((a_x + width / 2) / width, (a_y + height / 2) / height),
            new Vector2((b_x + width / 2) / width, (b_y + height / 2) / height),
            new Vector2((c_x + width / 2) / width, (c_y + height / 2) / height),
          ];
        },
        generateSideWallUV: function (_geometry, _vertices, _indexA, _indexB, _indexC, _indexD) {
          // fixing UV mapping for side walls
          return [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)];
        },
      },
    };

    super(shape, extrudeSettings);

    const positionAttr = this.attributes.position;
    const normalAttr = this.attributes.normal;

    const frontIndices = [];
    const backIndices = [];
    const sideIndices = [];

    // === ↓ ensuring there are 3 groups: front, back, and side ↓ ===
    // Group faces based on their normals
    for (let i = 0; i < positionAttr.count; i += 3) {
      const normalZ = normalAttr.getZ(i);
      if (Math.abs(normalZ) > 0.9) {
        // Front or back face
        if (normalZ > 0) {
          frontIndices.push(i, i + 1, i + 2);
        } else {
          backIndices.push(i, i + 1, i + 2);
        }
      } else {
        // Side faces
        sideIndices.push(i, i + 1, i + 2);
      }
    }

    this.clearGroups();

    // Add groups for each face type
    if (frontIndices.length > 0) this.addGroup(0, frontIndices.length, 0);
    if (backIndices.length > 0) this.addGroup(frontIndices.length, backIndices.length, 1);
    if (sideIndices.length > 0) this.addGroup(frontIndices.length + backIndices.length, sideIndices.length, 2);

    // Update the index buffer to match our new grouping
    const newIndex = [...frontIndices, ...backIndices, ...sideIndices];
    this.setIndex(newIndex);
  }
}

extend({ roundedRectGeometry: RoundedRectGeometry });

const RoundedRectangleGeometry = forwardRef<BufferGeometry, RoundedRectangleGeometryProps>(({ args }, ref) => {
  const [width, height, radius, depth] = args;
  const geom = useMemo(() => new RoundedRectGeometry(width, height, radius, depth), [width, height, radius, depth]);
  return <primitive ref={ref} object={geom} attach="geometry" />;
});

export { RoundedRectangleGeometry };
