"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Individual } from "@/lib/api";

interface TreeNode {
  id: string;
  data: Individual;
  children?: TreeNode[];
}

interface HourglassChartProps {
  root: Individual;
  ancestors: Individual[];
  descendants: Individual[];
  onNodeClick?: (individual: Individual) => void;
}

interface D3Node extends d3.HierarchyPointNode<TreeNode> {
  data: TreeNode;
}

const NODE_W = 100;
const NODE_H = 50;
const HS = 20;
const VS = 60;

function buildTree(root: Individual, individuals: Individual[]): TreeNode {
  function buildNode(ind: Individual): TreeNode {
    const children: TreeNode[] = [];
    if (ind.father_id) {
      const f = individuals.find((a) => a.id === ind.father_id);
      if (f) children.push(buildNode(f));
    }
    if (ind.mother_id) {
      const m = individuals.find((a) => a.id === ind.mother_id);
      if (m) children.push(buildNode(m));
    }
    return { id: ind.gedcom_id, data: ind, children: children.length ? children : undefined };
  }
  return buildNode(root);
}

export function HourglassChart({ root, ancestors, descendants, onNodeClick }: HourglassChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const allIndividuals = [root, ...ancestors, ...descendants];
    const ancestorsTree = buildTree(root, allIndividuals);
    const descendantsTree = buildTree(root, allIndividuals);

    const width = containerRef.current.clientWidth;
    const height = 700;

    svg.attr("width", width).attr("height", height);

    const midX = width / 2;
    const mainG = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => mainG.attr("transform", event.transform));
    svg.call(zoom);

    const renderTree = (
      tree: TreeNode,
      offsetX: number,
      direction: "down" | "up"
    ) => {
      const g = mainG.append("g").attr("transform", `translate(${offsetX}, 20)`);

      const layout = d3.tree<TreeNode>().nodeSize([NODE_H + VS, NODE_W + HS]);
      const hierarchy = d3.hierarchy<TreeNode>(tree);
      const treeRoot = layout(hierarchy) as D3Node;

      g.selectAll("path.link")
        .data(treeRoot.links())
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "hsl(var(--border))")
        .attr("stroke-width", 2)
        .attr("d", d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
          .x((d) => d.x!)
          .y((d) => d.y!) as unknown as string);

      const nodes = g
        .selectAll<SVGGElement, D3Node>("g.node")
        .data(treeRoot.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x! - NODE_W / 2},${d.y! - NODE_H / 2})`)
        .style("cursor", "pointer")
        .on("click", (_event, d) => onNodeClick?.(d.data.data));

      nodes.append("rect")
        .attr("width", NODE_W).attr("height", NODE_H).attr("rx", 6)
        .attr("fill", "hsl(var(--card))")
        .attr("stroke", (d) =>
          d.data.id === root.gedcom_id
            ? "hsl(var(--primary))"
            : "hsl(var(--border))"
        )
        .attr("stroke-width", (d) =>
          d.data.id === root.gedcom_id ? 2 : 1.5
        );

      nodes.append("text")
        .attr("x", NODE_W / 2).attr("y", NODE_H / 2 - 6)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-size", 11).attr("font-weight", 600)
        .attr("fill", "hsl(var(--foreground))")
        .text((d) => {
          const name = d.data.data.names?.[0]?.full || d.data.id;
          return name.length > 12 ? name.slice(0, 10) + "…" : name;
        });

      nodes.append("text")
        .attr("x", NODE_W / 2).attr("y", NODE_H / 2 + 10)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-size", 9).attr("fill", "hsl(var(--muted-foreground))")
        .text((d) => d.data.id);
    };

    renderTree(ancestorsTree, midX, "down");
    renderTree(descendantsTree, midX, "up");

  }, [root, ancestors, descendants, onNodeClick]);

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
