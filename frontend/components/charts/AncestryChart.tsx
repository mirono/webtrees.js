"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Individual } from "@/lib/api";

interface TreeNode {
  id: string;
  data: Individual;
  children?: TreeNode[];
  x?: number;
  y?: number;
}

interface AncestryChartProps {
  root: Individual;
  ancestors: Individual[];
  onNodeClick?: (individual: Individual) => void;
}

interface D3Node extends d3.HierarchyPointNode<TreeNode> {
  data: TreeNode;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const H_SPACING = 30;
const V_SPACING = 80;

function buildTree(root: Individual, ancestors: Individual[]): TreeNode {
  const nodeMap = new Map<string, Individual>();
  nodeMap.set(root.gedcom_id, root);
  ancestors.forEach((a) => nodeMap.set(a.gedcom_id, a));

  function findParents(ind: Individual): TreeNode {
    const children: TreeNode[] = [];
    const birthEvent = ind.events?.find((e) => e.event_type === "BIRT");
    if (birthEvent?.place) {
      ancestors
        .filter((a) => {
          const death = a.events?.find((e) => e.event_type === "DEAT");
          return death?.place === birthEvent.place;
        })
        .forEach((parent) => {
          if (!nodeMap.get(`placed_${parent.gedcom_id}`)) {
            nodeMap.set(`placed_${parent.gedcom_id}`, parent);
            children.push(findParents(parent));
          }
        });
    }

    const father = ind.father_id
      ? ancestors.find((a) => a.id === ind.father_id)
      : undefined;
    const mother = ind.mother_id
      ? ancestors.find((a) => a.id === ind.mother_id)
      : undefined;

    if (father && !children.find((c) => c.id === father.gedcom_id)) {
      children.push(findParents(father));
    }
    if (mother && !children.find((c) => c.id === mother.gedcom_id)) {
      children.push(findParents(mother));
    }

    return { id: ind.gedcom_id, data: ind, children: children.length ? children : undefined };
  }

  return findTree(root, ancestors);
}

function findTree(root: Individual, ancestors: Individual[]): TreeNode {
  const nodeMap = new Map<string, Individual>();
  nodeMap.set(root.gedcom_id, root);
  ancestors.forEach((a) => nodeMap.set(a.gedcom_id, a));

  function buildNode(ind: Individual): TreeNode {
    const children: TreeNode[] = [];
    if (ind.father_id) {
      const father = ancestors.find((a) => a.id === ind.father_id);
      if (father) children.push(buildNode(father));
    }
    if (ind.mother_id) {
      const mother = ancestors.find((a) => a.id === ind.mother_id);
      if (mother) children.push(buildNode(mother));
    }
    return { id: ind.gedcom_id, data: ind, children: children.length ? children : undefined };
  }

  return buildNode(root);
}

export function AncestryChart({ root, ancestors, onNodeClick }: AncestryChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const treeData = findTree(root, ancestors);
    if (!treeData) return;

    const width = container.clientWidth;
    const height = Math.max(600, ancestors.length * 40);

    svg.attr("width", width).attr("height", height);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const g = svg.append("g").attr("transform", `translate(${width / 2}, 60)`);

    const treeLayout = d3.tree<TreeNode>()
      .nodeSize([NODE_HEIGHT + V_SPACING, NODE_WIDTH + H_SPACING]);

    const hierarchy = d3.hierarchy<TreeNode>(treeData);
    const treeRoot = treeLayout(hierarchy) as D3Node;

    const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
      .x((d) => d.x!)
      .y((d) => d.y!);

    g.selectAll<SVGPathElement, d3.HierarchyPointLink<TreeNode>>("path.link")
      .data(treeRoot.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 2)
      .attr("d", linkGenerator as unknown as string);

    const nodes = g
      .selectAll<SVGGElement, D3Node>("g.node")
      .data(treeRoot.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x! - NODE_WIDTH / 2},${d.y! - NODE_HEIGHT / 2})`)
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        onNodeClick?.(d.data.data);
      });

    nodes
      .append("rect")
      .attr("width", NODE_WIDTH)
      .attr("height", NODE_HEIGHT)
      .attr("rx", 6)
      .attr("fill", "hsl(var(--card))")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1.5);

    nodes
      .append("text")
      .attr("x", NODE_WIDTH / 2)
      .attr("y", NODE_HEIGHT / 2 - 6)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("fill", "hsl(var(--foreground))")
      .text((d) => {
        const name = d.data.data.names?.[0]?.full || d.data.id;
        return name.length > 14 ? name.slice(0, 12) + "…" : name;
      });

    nodes
      .append("text")
      .attr("x", NODE_WIDTH / 2)
      .attr("y", NODE_HEIGHT / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "hsl(var(--muted-foreground))")
      .text((d) => d.data.id);

  }, [root, ancestors, onNodeClick]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full overflow-auto rounded-lg border border-border">
      <svg ref={svgRef} />
    </div>
  );
}
