import type { Point2D, PathWaypoint, RobotEntity, HumanEntity } from '../../types';

/**
 * Moves an entity along its predefined path waypoints smoothly based on elapsed time dt (seconds)
 */
export function updateEntityPathPosition(
  currentPos: Point2D,
  currentSpeed: number,
  path: PathWaypoint[],
  currentWaypointIndex: number,
  dt: number
): { newPos: Point2D; newWaypointIndex: number; direction: number; reachedEnd: boolean } {
  if (!path || path.length === 0) {
    return { newPos: { ...currentPos }, newWaypointIndex: 0, direction: 0, reachedEnd: true };
  }

  if (currentWaypointIndex >= path.length) {
    const lastPoint = path[path.length - 1];
    return { newPos: { ...lastPoint }, newWaypointIndex: path.length - 1, direction: 0, reachedEnd: true };
  }

  const target = path[currentWaypointIndex];
  const dx = target.x - currentPos.x;
  const dy = target.y - currentPos.y;
  const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
  const direction = Math.atan2(dy, dx);

  const stepDistance = currentSpeed * dt;

  if (distanceToTarget <= stepDistance || distanceToTarget < 0.1) {
    const nextIndex = (currentWaypointIndex + 1) % path.length;
    return {
      newPos: { x: target.x, y: target.y },
      newWaypointIndex: nextIndex,
      direction,
      reachedEnd: nextIndex === 0,
    };
  }

  const moveFraction = stepDistance / distanceToTarget;
  const newX = currentPos.x + dx * moveFraction;
  const newY = currentPos.y + dy * moveFraction;

  return {
    newPos: { x: Math.round(newX * 1000) / 1000, y: Math.round(newY * 1000) / 1000 },
    newWaypointIndex: currentWaypointIndex,
    direction,
    reachedEnd: false,
  };
}

/**
 * Updates robot motion state during simulation frame
 */
export function updateRobotMotion(robot: RobotEntity, dt: number): RobotEntity {
  if (robot.status === 'IDLE' || robot.status === 'EMERGENCY_STOP' || robot.status === 'PAUSED') {
    return { ...robot, currentSpeed: robot.status === 'EMERGENCY_STOP' ? 0 : robot.currentSpeed };
  }

  const { newPos, newWaypointIndex, direction } = updateEntityPathPosition(
    robot.position,
    robot.currentSpeed,
    robot.path,
    robot.currentWaypointIndex,
    dt
  );

  return {
    ...robot,
    position: newPos,
    currentWaypointIndex: newWaypointIndex,
    direction,
    status: 'MOVING',
  };
}

/**
 * Updates human motion state during simulation frame
 */
export function updateHumanMotion(human: HumanEntity, dt: number): HumanEntity {
  if (human.status === 'IDLE' || human.status === 'WORKING') {
    return human;
  }

  const { newPos, newWaypointIndex, direction } = updateEntityPathPosition(
    human.position,
    human.currentSpeed,
    human.path,
    human.currentWaypointIndex,
    dt
  );

  return {
    ...human,
    position: newPos,
    currentWaypointIndex: newWaypointIndex,
    direction,
    status: 'WALKING',
  };
}

/**
 * Updates all robots and humans in a multi-agent simulation step
 */
export function updateMultiAgentMotion(
  robots: RobotEntity[],
  humans: HumanEntity[],
  dt: number
): { robots: RobotEntity[]; humans: HumanEntity[] } {
  const updatedRobots = robots.map((robot) => updateRobotMotion(robot, dt));
  const updatedHumans = humans.map((human) => updateHumanMotion(human, dt));

  return {
    robots: updatedRobots,
    humans: updatedHumans,
  };
}
