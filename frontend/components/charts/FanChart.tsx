"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Individual } from "@/lib/api";

interface TreeInd extends Individual {
  children?: TreeInd[];
}

interface FanChartProps {
  individuals: Individual[];
  rootId: string;
  onNodeClick?: (individual: Individual) => void;
}

interface D3Node extends d3.HierarchyPointNode<TreeInd> {}

const INNER_RADIUS = 80;
const NODE_HEIGHT = 28;
const ARC_SPACING = 28;

function findRoot(individuals: Individual[], rootId: string): Individual | undefined {
  return individuals.find((i) => i.gedcom_id === rootId);
}

function buildHierarchy(individuals: Individual[], root: Individual): d3.HierarchyNode<TreeInd> {
  function buildNode(ind: Individual): TreeInd {
    const children: TreeInd[] = [];
    individuals
      .filter((d) => d.father_id === ind.id || d.mother_id === ind.id)
      .forEach((child) => children.push(buildNode(child)));
    return {
      ...ind,
      children: children.length ? children : undefined,
    };
  }

  return d3.hierarchy<TreeInd>(buildNode(root));
}

export function FanChart({ individuals, rootId, onNodeClick }: FanChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = findRoot(individuals, rootId);
    if (!root) return;

    const hierarchy = buildHierarchy(individuals, root);
    const treeLayout = d3.tree<TreeInd>();
    const treeRoot = treeLayout(hierarchy) as D3Node;

    const depth = treeRoot.height;
    const maxRadius = INNER_RADIUS + depth * ARC_SPACING + NODE_HEIGHT;
    const width = maxRadius * 2 + 20;
    const height = maxRadius * 2 + 20;

    svg.attr("width", width).attr("height", height);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    const g = svg.append("g").attr("transform", `translate(${maxRadius + 10},${maxRadius + 10})`);

    const treeHeight = treeRoot.height;
    const angles: Record<number, number> = {};
    treeRoot.each((node) => {
      if (node.depth === 0) {
        angles[node.depth] = 0;
      } else {
        const fraction = 1 / Math.pow(2, node.depth);
        const parentAngle = angles[(node.depth - 1) * 2] ?? 0;
        angles[node.depth] = parentAngle + fraction;
      }
    });

    const radialLine = d3.lineRadial<d3.HierarchyPointNode<Individual>>()
      .angle((d) => (d.x ?? 0))
      .radius((d) => INNER_RADIUS + d.depth * ARC_SPACING);

    g.selectAll("path.link")
      .data(treeRoot.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 2)
      .attr("d", radialLine as unknown as string);

    const nodes = g
      .selectAll<SVGGElement, D3Node>("g.node")
      .data(treeRoot.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d) =>
          `translate(${Math.cos((d.x ?? 0) - Math.PI / 2) * (INNER_RADIUS + d.depth * ARC_SPACING)},${Math.sin((d.x ?? 0) - Math.PI / 2) * (INNER_RADIUS + d.depth * ARC_SPACING)})`
      )
      .style("cursor", "pointer")
      .on("click", (_event, d) => onNodeClick?.(d.data));

    const wedgeAngle = Math.PI / Math.pow(2, depth || 1);

    nodes.append("rect")
      .attr("x", -NODE_HEIGHT / 2)
      .attr("y", -NODE_HEIGHT / 2)
      .attr("width", NODE_HEIGHT)
      .attr("height", NODE_HEIGHT)
      .attr("rx", 4)
      .attr("fill", "hsl(var(--card))")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1.5)
      .attr("transform", (d) => `rotate(${((d.x ?? 0) * 180) / Math.PI - 90})`);

    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .attr("fill", "hsl(var(--foreground))")
      .attr("dy", "0.35em")
      .attr("transform", (d) => `rotate(${((d.x ?? 0) * 180) / Math.PI - 90})`)
      .text((d) => {
        const name = d.data.names?.[0]?.full || d.data.gedcom_id;
        return name.length > 6 ? name.slice(0, 5) + "…" : name;
      });

  }, [individuals, rootId, onNodeClick]);

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
