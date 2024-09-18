const AbilityTile = ({ x, y }: { x: number; y: number }) => {
  return (
    <mesh position={[x, y, 0]}>
      <circleGeometry args={[4, 32]} />
      <meshBasicMaterial color={"white"} />
    </mesh>
  );
};

export default AbilityTile;
