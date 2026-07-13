"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Individual } from "@/lib/api";

interface TreeNode {
  id: string;
  data: Individual;
  children?: TreeNode[];
}

interface DescendantsChartProps {
  root: Individual;
  descendants: Individual[];
  onNodeClick?: (individual: Individual) => void;
}

interface D3Node extends d3.HierarchyPointNode<TreeNode> {
  data: TreeNode;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const H_SPACING = 30;
const V_SPACING = 80;

function buildDescendantsTree(root: Individual, descendants: Individual[]): TreeNode {
  function buildNode(ind: Individual): TreeNode {
    const children: TreeNode[] = [];
    descendants
      .filter((d) => d.father_id === ind.id || d.mother_id === ind.id)
      .forEach((child) => children.push(buildNode(child)));
    return { id: ind.gedcom_id, data: ind, children: children.length ? children : undefined };
  }
  return buildNode(root);
}

export function DescendantsChart({ root, descendants, onNodeClick }: DescendantsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const treeData = buildDescendantsTree(root, descendants);
    const width = containerRef.current.clientWidth;
    const height = Math.max(400, descendants.length * 30);

    svg.attr("width", width).attr("height", height);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    const g = svg.append("g").attr("transform", "translate(60, 20)");

    const treeLayout = d3.tree<TreeNode>()
      .nodeSize([NODE_WIDTH + H_SPACING, NODE_HEIGHT + V_SPACING]);

    const hierarchy = d3.hierarchy<TreeNode>(treeData);
    const treeRoot = treeLayout(hierarchy) as D3Node;

    g.selectAll<SVGPathElement, d3.HierarchyPointLink<TreeNode>>("path.link")
      .data(treeRoot.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x((d) => d.x!)
        .y((d) => d.y!) as unknown as string);

    const nodes = g
      .selectAll<SVGGElement, D3Node>("g.node")
      .data(treeRoot.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x! - NODE_WIDTH / 2},${d.y! - NODE_HEIGHT / 2})`)
      .style("cursor", "pointer")
      .on("click", (_event, d) => onNodeClick?.(d.data.data));

    nodes.append("rect")
      .attr("width", NODE_WIDTH)
      .attr("height", NODE_HEIGHT)
      .attr("rx", 6)
      .attr("fill", "hsl(var(--card))")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1.5);

    nodes.append("text")
      .attr("x", NODE_WIDTH / 2).attr("y", NODE_HEIGHT / 2 - 6)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("font-size", 12).attr("font-weight", 600)
      .attr("fill", "hsl(var(--foreground))")
      .text((d) => {
        const name = d.data.data.names?.[0]?.full || d.data.id;
        return name.length > 14 ? name.slice(0, 12) + "…" : name;
      });

    nodes.append("text")
      .attr("x", NODE_WIDTH / 2).attr("y", NODE_HEIGHT / 2 + 10)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("font-size", 10).attr("fill", "hsl(var(--muted-foreground))")
      .text((d) => d.data.id);

  }, [root, descendants, onNodeClick]);

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
