"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Individual } from "@/lib/api";

interface RelationshipChartProps {
  from: Individual;
  to: Individual;
  path: Individual[];
  onNodeClick?: (individual: Individual) => void;
}

const NODE_W = 100;
const NODE_H = 50;

interface PathNode {
  id: string;
  data: Individual;
  isPivot: boolean;
}

export function RelationshipChart({ from, to, path, onNodeClick }: RelationshipChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const pathNodes: PathNode[] = path.length >= 2
      ? path.map((ind, i) => ({
          id: ind.gedcom_id,
          data: ind,
          isPivot: i > 0 && i < path.length - 1,
        }))
      : [
          { id: from.gedcom_id, data: from, isPivot: false },
          { id: to.gedcom_id, data: to, isPivot: false },
        ];

    const width = containerRef.current.clientWidth;
    const height = Math.max(300, pathNodes.length * 80 + 60);

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${width / 2}, 30)`);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    const stepWidth = NODE_W + 40;

    pathNodes.forEach((ind, i) => {
      const x = (i - (pathNodes.length - 1) / 2) * stepWidth;
      const isHighlighted = i === 0 || i === pathNodes.length - 1;

      const nodeG = g.append("g")
        .attr("transform", `translate(${x - NODE_W / 2},${-NODE_H / 2})`)
        .style("cursor", "pointer")
        .on("click", () => onNodeClick?.(ind.data));

      nodeG.append("rect")
        .attr("width", NODE_W).attr("height", NODE_H).attr("rx", 6)
        .attr("fill", isHighlighted ? "hsl(var(--primary))" : "hsl(var(--card))")
        .attr("stroke", "hsl(var(--border))")
        .attr("stroke-width", isHighlighted ? 2 : 1.5);

      nodeG.append("text")
        .attr("x", NODE_W / 2).attr("y", NODE_H / 2 - 6)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-size", 11).attr("font-weight", 600)
        .attr("fill", isHighlighted ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))")
        .text(() => {
          const name = ind.data.names?.[0]?.full || ind.id;
          return name.length > 12 ? name.slice(0, 10) + "…" : name;
        });

      nodeG.append("text")
        .attr("x", NODE_W / 2).attr("y", NODE_H / 2 + 10)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-size", 9)
        .attr("fill", isHighlighted ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))")
        .text(ind.id);

      if (i > 0) {
        g.append("line")
          .attr("x1", x - stepWidth).attr("y1", 0)
          .attr("x2", x).attr("y2", 0)
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");
      }
    });

    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10).attr("refY", 5)
      .attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "hsl(var(--muted-foreground))");

  }, [from, to, path, onNodeClick]);

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
