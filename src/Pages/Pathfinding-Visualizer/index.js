import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';
import './Pathfinding-Visualizer.css';

import { ASTAR, DIJKSTRA } from '../../const/Algorithms';
import AStar from '../../Algorithms/PathFinding/A-Star';
import Dijkstra from '../../Algorithms/PathFinding/Dijsktra';
import { VisualizeAlgorithm } from '../../Actions/algoAction';
import Node from './Node';
import { getInitialGrid, getNewGridWithWallToggled } from './utils';
import { message, notification } from 'antd';
import { Button } from 'antd/lib/radio';

function PathfindingVisualizer({ nodes, algorithm, visualizeState, visualizeAlgorithm }) {
  const { startNode, finishNode } = nodes;
  const [mouseIsPressed, updateMousePressed] = useState(false);
  const [grid, updateGrid] = useState([]);

  useEffect(() => {
    updateGrid(getInitialGrid(55, 25, startNode, finishNode))
    const notificationMessage = {
      message: 'Create obstacles',
      description: 'You can create obstacles on clicking the grid and make the algorithm work harder :)',
      duration: 10,
    };
    notification.info(notificationMessage)
  }, [startNode, finishNode])

  function StartAlgorithm() {
    let checked, path;
    visualizeAlgorithm(false)
    switch (algorithm) {
      case ASTAR: {
        const result = AStar(grid, startNode, finishNode);
        path = result.path;
        checked = result.checked;
        break;
      }
      case DIJKSTRA: {
        const result = Dijkstra(grid, startNode, finishNode);
        path = result.path;
        checked = result.checked;
        break;
      }
      default:
        break;
    }
    animateGrid(checked, path);
  }

  function animateShortestPath(nodesInShortestPathOrder) {
    if (nodesInShortestPathOrder === -1) {
      message.error("Sorry, couldn't find the path.")
      return;
    }
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.x}-${node.y}`).className = 'node node-shortest-path';
      }, 50 * i);
    }
    message.success("Horray, found the path.");
    const notificationMessage = {
      message: 'Notification Title',
      description: 'Please refresh the page to visualize algorithm again, we haven not set up Clear button in website yet, work in progress!',
      duration: 0,
    };
    notification.warn(notificationMessage);
  }

  function animateGrid(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.x}-${node.y}`).className = 'node node-visited';
      }, 10 * i);
    }
  }

  function handleMouseDown(x, y) {
    const newGrid = getNewGridWithWallToggled(grid, x, y);
    updateGrid(newGrid);
    updateMousePressed(true);
  }

  function handleMouseEnter(x, y) {
    if (!mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, x, y);
    updateGrid(newGrid);
  }

  function handleMouseUp() {
    updateMousePressed(false);
  }

  if (visualizeState) {
    StartAlgorithm();
  }

  return (
    <div>
      <div className='grid'>
        {grid.map((row, indexRow) => {
          return (
            <div className='column' key={indexRow}>
              {row.map((node, nodeIndex) => (
                <Node key={nodeIndex} node={node} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter} />
              ))}
            </div>
          )
        })}
      </div>
      <Button onClick={() => updateGrid(getInitialGrid(55, 25, startNode, finishNode))}>Clean</Button>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    nodes: state.nodes,
    visualizeState: state.algorithm.visualizeState,
    algorithm: state.algorithm.algorithm
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    visualizeAlgorithm: visualizeState => dispatch(VisualizeAlgorithm(visualizeState))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PathfindingVisualizer);
