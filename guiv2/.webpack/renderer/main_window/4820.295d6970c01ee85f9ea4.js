"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4820],{

/***/ 24820:
/*!*****************************************************************************!*\
  !*** ./src/renderer/views/organisation/OrganisationMapView.tsx + 2 modules ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  OrganisationMapView: () => (/* binding */ OrganisationMapView),
  "default": () => (/* binding */ organisation_OrganisationMapView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/hooks/useOrganisationMapLogic.ts
/**
 * useOrganisationMapLogic Hook
 *
 * Data aggregation logic for Organisation Map feature.
 * Reads all CSV files from discovery modules and constructs Sankey diagram data.
 */

const useOrganisationMapLogic = () => {
    const [data, setData] = (0,react.useState)(null);
    const [loading, setLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('[useOrganisationMapLogic] Starting data fetch...');
            // Get all CSV files from discovery data
            const csvFiles = await window.electronAPI.invoke('get-discovery-files');
            console.log('[useOrganisationMapLogic] Found CSV files:', csvFiles.length);
            // Process each CSV file
            const allNodes = [];
            const allLinks = [];
            for (const file of csvFiles) {
                console.log('[useOrganisationMapLogic] Processing file:', file.path, 'Type:', file.type);
                try {
                    const content = await window.electronAPI.invoke('read-discovery-file', file.path);
                    const fileNodes = parseCSVToNodes(content, file.type);
                    const fileLinks = generateLinksForFile(fileNodes, file.type);
                    console.log('[useOrganisationMapLogic] File parsed:', {
                        path: file.path,
                        nodes: fileNodes.length,
                        links: fileLinks.length
                    });
                    allNodes.push(...fileNodes);
                    allLinks.push(...fileLinks);
                }
                catch (fileError) {
                    console.warn('[useOrganisationMapLogic] Failed to process file:', file.path, fileError);
                }
            }
            console.log('[useOrganisationMapLogic] Total before merge:', {
                nodes: allNodes.length,
                links: allLinks.length
            });
            // Merge duplicate nodes and links
            const mergedData = mergeDuplicateEntities(allNodes, allLinks);
            console.log('[useOrganisationMapLogic] Total after merge:', {
                nodes: mergedData.nodes.length,
                links: mergedData.links.length
            });
            setData(mergedData);
        }
        catch (err) {
            console.error('[useOrganisationMapLogic] Error fetching organisation map data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        }
        finally {
            setLoading(false);
        }
    };
    (0,react.useEffect)(() => {
        fetchData();
    }, []);
    const refetch = () => {
        fetchData();
    };
    return { data, loading, error, refetch };
};
/**
 * Parse CSV content to SankeyNode array
 */
function parseCSVToNodes(csvContent, fileType) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2)
        return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
    const nodes = [];
    rows.forEach((row, index) => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const record = {};
        headers.forEach((header, i) => {
            record[header] = values[i] || '';
        });
        const node = createNodeFromRecord(record, fileType, index);
        if (node) {
            nodes.push(node);
        }
    });
    return nodes.filter(Boolean);
}
/**
 * Create SankeyNode from CSV record
 * CRITICAL: Use PascalCase property names to match PowerShell output
 * Works with actual discovery data (Users, Groups, Devices, Mailboxes, etc.)
 */
function createNodeFromRecord(record, fileType, index) {
    // Map file types to entity types and extract relevant fields
    const typeMapping = {
        'user': {
            type: 'application', // Users as applications for visualization
            getName: (r) => r.DisplayName || r.UserPrincipalName || r.SamAccountName || r.Name
        },
        'group': {
            type: 'platform', // Groups as platforms
            getName: (r) => r.DisplayName || r.Name || r.GroupName
        },
        'mailbox': {
            type: 'application',
            getName: (r) => r.DisplayName || r.PrimarySmtpAddress || r.Name
        },
        'device': {
            type: 'it-component',
            getName: (r) => r.Name || r.ComputerName || r.DeviceName || r.DisplayName
        },
        'server': {
            type: 'it-component',
            getName: (r) => r.Name || r.ServerName || r.ComputerName
        },
        'application': {
            type: 'application',
            getName: (r) => r.Name || r.DisplayName || r.ApplicationName
        },
        'infrastructure': {
            type: 'datacenter',
            getName: (r) => r.Name || r.DisplayName
        }
    };
    const mapping = typeMapping[fileType.toLowerCase()];
    if (!mapping) {
        // Unknown type, skip
        return null;
    }
    const name = mapping.getName(record);
    if (!name || name.trim() === '') {
        return null;
    }
    const nodeType = mapping.type;
    const uniqueId = `${nodeType}-${name}-${index}`;
    return {
        id: uniqueId,
        name: name,
        type: nodeType,
        factSheet: createFactSheet(record, nodeType),
        metadata: { source: fileType, record }
    };
}
/**
 * Create FactSheet from CSV record
 * CRITICAL: Use PascalCase property names
 */
function createFactSheet(record, type) {
    return {
        baseInfo: {
            name: record.Name || record.DisplayName || record.ApplicationName || 'Unknown',
            type,
            description: record.Description || '',
            owner: record.Owner || record.ManagerDisplayName || '',
            status: (record.Status || 'active').toLowerCase()
        },
        relations: {
            incoming: [],
            outgoing: []
        },
        itComponents: [],
        subscriptions: [],
        comments: [],
        todos: [],
        resources: [],
        metrics: [],
        surveys: [],
        lastUpdate: new Date(record.LastModified || record.CreatedDateTime || Date.now())
    };
}
/**
 * Generate links between nodes based on hierarchical relationships
 * Works with actual discovery data relationships (users→groups, devices→servers, etc.)
 */
function generateLinksForFile(nodes, fileType) {
    const links = [];
    // Create relationships based on discovered data
    nodes.forEach(node => {
        const record = node.metadata.record;
        // Link users to groups they belong to
        if (fileType.toLowerCase() === 'user' && record.Groups) {
            const groups = Array.isArray(record.Groups) ? record.Groups : [record.Groups];
            groups.forEach((groupName) => {
                if (groupName && groupName.trim()) {
                    // Find matching group node
                    const groupNode = nodes.find(n => n.type === 'platform' && n.name === groupName);
                    if (groupNode) {
                        links.push({
                            source: groupNode.id,
                            target: node.id,
                            value: 1,
                            type: 'membership'
                        });
                    }
                }
            });
        }
        // Link mailboxes to users (by matching names/UPNs)
        if (fileType.toLowerCase() === 'mailbox' && record.UserPrincipalName) {
            const userNode = nodes.find(n => n.type === 'application' &&
                (n.metadata.record.UserPrincipalName === record.UserPrincipalName ||
                    n.metadata.record.DisplayName === record.DisplayName));
            if (userNode) {
                links.push({
                    source: userNode.id,
                    target: node.id,
                    value: 1,
                    type: 'ownership'
                });
            }
        }
        // Link devices to servers or infrastructure
        if (fileType.toLowerCase() === 'device' && record.ServerName) {
            const serverNode = nodes.find(n => n.type === 'it-component' && n.name === record.ServerName);
            if (serverNode) {
                links.push({
                    source: serverNode.id,
                    target: node.id,
                    value: 1,
                    type: 'deployment'
                });
            }
        }
    });
    return links;
}
/**
 * Merge duplicate nodes and links
 */
function mergeDuplicateEntities(nodes, links) {
    // Remove duplicate nodes by ID
    const uniqueNodes = nodes.reduce((acc, node) => {
        if (!acc.find(n => n.id === node.id)) {
            acc.push(node);
        }
        return acc;
    }, []);
    // Remove duplicate links
    const uniqueLinks = links.reduce((acc, link) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        if (!acc.find(l => {
            const lSourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const lTargetId = typeof l.target === 'string' ? l.target : l.target.id;
            return lSourceId === sourceId && lTargetId === targetId;
        })) {
            acc.push(link);
        }
        return acc;
    }, []);
    return { nodes: uniqueNodes, links: uniqueLinks };
}

// EXTERNAL MODULE: ./node_modules/d3/src/index.js + 53 modules
var src = __webpack_require__(94634);
// EXTERNAL MODULE: ./node_modules/d3-sankey/src/index.js + 118 modules
var d3_sankey_src = __webpack_require__(95493);
;// ./src/renderer/components/organisms/SankeyDiagram.tsx

/**
 * SankeyDiagram Component
 *
 * Interactive D3.js-powered Sankey diagram for Organization Map visualization.
 * Displays hierarchical relationships between entities with flow-based layout.
 */

// @ts-expect-error - d3 types not installed, runtime functionality works

// @ts-expect-error - d3-sankey types not installed, runtime functionality works

// Type color mapping for entities
const TYPE_COLORS = {
    'company': '#3b82f6', // blue-500
    'platform': '#8b5cf6', // violet-500
    'application': '#10b981', // emerald-500
    'datacenter': '#f59e0b', // amber-500
    'provider-interface': '#06b6d4', // cyan-500
    'consumer-interface': '#ec4899', // pink-500
    'business-capability': '#6366f1', // indigo-500
    'it-component': '#84cc16', // lime-500
};
const SankeyDiagram = ({ nodes, links, width = 1200, height = 600, onNodeClick, onNodeHover, }) => {
    const svgRef = (0,react.useRef)(null);
    const [hoveredNode, setHoveredNode] = (0,react.useState)(null);
    (0,react.useEffect)(() => {
        if (!svgRef.current || nodes.length === 0)
            return;
        console.log('[SankeyDiagram] Rendering:', { nodes: nodes.length, links: links.length });
        // Clear previous content
        src.select(svgRef.current).selectAll('*').remove();
        // Create SVG container
        const svg = src.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('background', 'transparent');
        // Add zoom behavior
        const g = svg.append('g');
        const zoom = src.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
        svg.call(zoom);
        // Prepare data for d3-sankey
        const sankeyGenerator = (0,d3_sankey_src.sankey)()
            .nodeId((d) => d.id)
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [width - 1, height - 6]]);
        // Create a copy of the data for d3-sankey (it mutates the objects)
        const graphData = {
            nodes: nodes.map(n => ({ ...n })),
            links: links.map(l => ({ ...l }))
        };
        // Validate data before generating layout
        if (graphData.nodes.length === 0) {
            console.warn('[SankeyDiagram] No nodes to render');
            g.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', '#9ca3af')
                .attr('font-size', '16px')
                .text('No entities to display');
            return;
        }
        // Filter out links that reference non-existent nodes
        const nodeIds = new Set(graphData.nodes.map(n => n.id));
        const validLinks = graphData.links.filter(l => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            const valid = nodeIds.has(sourceId) && nodeIds.has(targetId);
            if (!valid) {
                console.warn('[SankeyDiagram] Skipping invalid link:', sourceId, '->', targetId);
            }
            return valid;
        });
        graphData.links = validLinks;
        console.log('[SankeyDiagram] Validated data:', {
            nodes: graphData.nodes.length,
            validLinks: validLinks.length,
            invalidLinks: links.length - validLinks.length
        });
        // If no links, use grid layout instead of Sankey
        if (validLinks.length === 0) {
            console.warn('[SankeyDiagram] No links found, using grid layout');
            // Calculate grid dimensions
            const nodeCount = graphData.nodes.length;
            const cols = Math.ceil(Math.sqrt(nodeCount));
            const rows = Math.ceil(nodeCount / cols);
            const cellWidth = (width - 40) / cols;
            const cellHeight = (height - 40) / rows;
            const nodeWidth = 15;
            const nodeHeight = 30;
            // Position nodes in a grid
            graphData.nodes.forEach((node, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                node.x0 = 20 + col * cellWidth;
                node.y0 = 20 + row * cellHeight;
                node.x1 = node.x0 + nodeWidth;
                node.y1 = node.y0 + nodeHeight;
                node.value = 1;
                node.sourceLinks = [];
                node.targetLinks = [];
            });
            // Use the gridded data as sankeyData
            const sankeyData = { nodes: graphData.nodes, links: [] };
            // Draw nodes only (no links to draw)
            const node = g.append('g')
                .attr('class', 'nodes')
                .selectAll('g')
                .data(sankeyData.nodes)
                .join('g')
                .attr('class', 'node');
            // Add node rectangles
            node.append('rect')
                .attr('x', (d) => d.x0)
                .attr('y', (d) => d.y0)
                .attr('height', (d) => d.y1 - d.y0)
                .attr('width', (d) => d.x1 - d.x0)
                .attr('fill', (d) => TYPE_COLORS[d.type] || '#6b7280')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .on('mouseenter', function (event, d) {
                setHoveredNode(d.id);
                if (onNodeHover)
                    onNodeHover(d);
                src.select(this).attr('stroke', '#fbbf24').attr('stroke-width', 3);
            })
                .on('mouseleave', function (event, d) {
                setHoveredNode(null);
                if (onNodeHover)
                    onNodeHover(null);
                src.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
            })
                .on('click', function (event, d) {
                if (onNodeClick)
                    onNodeClick(d);
            });
            // Add node labels
            node.append('text')
                .attr('x', (d) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
                .attr('y', (d) => (d.y1 + d.y0) / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', (d) => d.x0 < width / 2 ? 'start' : 'end')
                .attr('font-size', '10px')
                .attr('fill', '#374151')
                .style('pointer-events', 'none')
                .text((d) => {
                const maxLength = 20;
                return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
            });
            // Add tooltips for grid layout
            const tooltip = src.select('body')
                .append('div')
                .attr('class', 'sankey-tooltip-grid')
                .style('position', 'absolute')
                .style('background', 'rgba(0, 0, 0, 0.8)')
                .style('color', '#fff')
                .style('padding', '8px 12px')
                .style('border-radius', '4px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .style('z-index', 10000);
            node
                .on('mousemove', function (event, d) {
                tooltip
                    .style('opacity', 1)
                    .html(`<strong>${d.name}</strong><br/>Type: ${d.type}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
                .on('mouseout', function () {
                tooltip.style('opacity', 0);
            });
            return () => {
                tooltip.remove();
            };
        }
        // Generate sankey layout (when we have links)
        let sankeyData;
        try {
            sankeyData = sankeyGenerator(graphData);
            console.log('[SankeyDiagram] Layout computed successfully');
            // Validate layout output
            const hasInvalidPositions = sankeyData.nodes.some((n) => isNaN(n.x0) || isNaN(n.y0) || isNaN(n.x1) || isNaN(n.y1));
            if (hasInvalidPositions) {
                throw new Error('Layout produced NaN coordinates');
            }
        }
        catch (error) {
            console.error('[SankeyDiagram] Layout computation failed:', error);
            // Show error message in SVG
            g.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', '#ef4444')
                .attr('font-size', '16px')
                .text('Unable to compute diagram layout. Check console for details.');
            return;
        }
        // Draw links (flows)
        const link = g.append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(sankeyData.links)
            .join('path')
            .attr('d', (0,d3_sankey_src.sankeyLinkHorizontal)())
            .attr('stroke', (d) => {
            const sourceNode = d.source;
            return TYPE_COLORS[sourceNode.type] || '#9ca3af';
        })
            .attr('stroke-width', (d) => Math.max(1, d.width))
            .attr('fill', 'none')
            .attr('opacity', 0.3)
            .attr('class', 'link')
            .style('mix-blend-mode', 'multiply');
        // Add link hover effect
        link
            .on('mouseenter', function (event, d) {
            src.select(this)
                .attr('opacity', 0.6)
                .attr('stroke-width', (d) => Math.max(2, d.width + 2));
        })
            .on('mouseleave', function () {
            src.select(this)
                .attr('opacity', 0.3)
                .attr('stroke-width', (d) => Math.max(1, d.width));
        });
        // Draw nodes
        const node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(sankeyData.nodes)
            .join('g')
            .attr('class', 'node');
        // Add node rectangles
        node.append('rect')
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('width', (d) => d.x1 - d.x0)
            .attr('fill', (d) => TYPE_COLORS[d.type] || '#6b7280')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseenter', function (event, d) {
            setHoveredNode(d.id);
            if (onNodeHover)
                onNodeHover(d);
            // Highlight connected links
            link.attr('opacity', (l) => {
                return (l.source.id === d.id || l.target.id === d.id) ? 0.6 : 0.1;
            });
            // Highlight node
            src.select(this)
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', 3);
        })
            .on('mouseleave', function (event, d) {
            setHoveredNode(null);
            if (onNodeHover)
                onNodeHover(null);
            // Reset link opacity
            link.attr('opacity', 0.3);
            // Reset node stroke
            src.select(this)
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);
        })
            .on('click', function (event, d) {
            if (onNodeClick)
                onNodeClick(d);
        });
        // Add node labels
        node.append('text')
            .attr('x', (d) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr('y', (d) => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', (d) => d.x0 < width / 2 ? 'start' : 'end')
            .attr('font-size', '12px')
            .attr('fill', '#374151')
            .style('pointer-events', 'none')
            .text((d) => {
            // Truncate long names
            const maxLength = 30;
            return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
        });
        // Add tooltips
        const tooltip = src.select('body')
            .append('div')
            .attr('class', 'sankey-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', '#fff')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 10000);
        node
            .on('mousemove', function (event, d) {
            tooltip
                .style('opacity', 1)
                .html(`
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Connections: ${(d.sourceLinks?.length || 0) + (d.targetLinks?.length || 0)}
          `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
            .on('mouseout', function () {
            tooltip.style('opacity', 0);
        });
        // Cleanup tooltip on unmount
        return () => {
            tooltip.remove();
        };
    }, [nodes, links, width, height, onNodeClick, onNodeHover]);
    if (nodes.length === 0) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full", children: (0,jsx_runtime.jsxs)("div", { className: "text-center text-gray-500", children: [(0,jsx_runtime.jsx)("p", { className: "text-lg font-semibold mb-2", children: "No Data Available" }), (0,jsx_runtime.jsx)("p", { className: "text-sm", children: "Run discovery modules to populate the organization map." })] }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900", children: [(0,jsx_runtime.jsx)("svg", { ref: svgRef, className: "w-full h-full" }), (0,jsx_runtime.jsxs)("div", { className: "absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold mb-2 text-gray-900 dark:text-white", children: "Entity Types" }), (0,jsx_runtime.jsx)("div", { className: "space-y-1", children: Object.entries(TYPE_COLORS).map(([type, color]) => ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("div", { className: "w-3 h-3 rounded", style: { backgroundColor: color } }), (0,jsx_runtime.jsx)("span", { className: "text-xs text-gray-700 dark:text-gray-300 capitalize", children: type.replace('-', ' ') })] }, type))) })] }), (0,jsx_runtime.jsx)("div", { className: "absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsxs)("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsx)("strong", { children: "Tip:" }), " Hover over nodes to highlight connections. Click to view details. Scroll to zoom."] }) })] }));
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Spinner.tsx
var Spinner = __webpack_require__(28709);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/views/organisation/OrganisationMapView.tsx

/**
 * Organisation Map View
 *
 * LeanIX-style Enterprise Architecture visualization with interactive Sankey diagram.
 * Aggregates all discovery data to show relationships between entities.
 */






const OrganisationMapView = () => {
    const { data, loading, error, refetch } = useOrganisationMapLogic();
    const [selectedNode, setSelectedNode] = (0,react.useState)(null);
    const [hoveredNode, setHoveredNode] = (0,react.useState)(null);
    console.log('[OrganisationMapView] Render:', { loading, error, nodes: data?.nodes.length, links: data?.links.length });
    const handleNodeClick = (node) => {
        console.log('[OrganisationMapView] Node clicked:', node);
        setSelectedNode(node);
        // TODO: Open fact sheet modal
    };
    const handleNodeHover = (node) => {
        setHoveredNode(node);
    };
    if (loading) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)(Spinner.Spinner, { size: "lg", label: "Loading organisation map data..." }), (0,jsx_runtime.jsx)("p", { className: "mt-4 text-gray-600 dark:text-gray-400", children: "Analyzing discovery data from all sources..." })] }) }));
    }
    if (error) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900", children: (0,jsx_runtime.jsxs)("div", { className: "text-center max-w-md", children: [(0,jsx_runtime.jsx)("div", { className: "text-red-500 mb-4", children: (0,jsx_runtime.jsx)(lucide_react.Network, { size: 48, className: "mx-auto" }) }), (0,jsx_runtime.jsx)("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Failed to Load Organisation Map" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: error }), (0,jsx_runtime.jsx)(Button.Button, { onClick: refetch, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { size: 16 }), children: "Retry" })] }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "h-screen flex flex-col bg-gray-50 dark:bg-gray-900", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react.Network, { size: 24, className: "text-blue-600" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Organisation Map" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Enterprise Architecture Visualization" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "ghost", icon: (0,jsx_runtime.jsx)(lucide_react.Search, { size: 16 }), title: "Search entities", children: "Search" }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "ghost", icon: (0,jsx_runtime.jsx)(lucide_react.ZoomIn, { size: 16 }), title: "Zoom in" }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "ghost", icon: (0,jsx_runtime.jsx)(lucide_react.ZoomOut, { size: 16 }), title: "Zoom out" }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "ghost", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { size: 16 }), title: "Export diagram", children: "Export" }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "ghost", icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { size: 16 }), onClick: refetch, title: "Refresh data", children: "Refresh" })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-6 text-sm", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Entities:" }), (0,jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900 dark:text-white", children: data?.nodes.length || 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Relationships:" }), (0,jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900 dark:text-white", children: data?.links.length || 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Companies:" }), (0,jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900 dark:text-white", children: data?.nodes.filter(n => n.type === 'company').length || 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Platforms:" }), (0,jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900 dark:text-white", children: data?.nodes.filter(n => n.type === 'platform').length || 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Applications:" }), (0,jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900 dark:text-white", children: data?.nodes.filter(n => n.type === 'application').length || 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Data Centers:" }), (0,jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900 dark:text-white", children: data?.nodes.filter(n => n.type === 'datacenter').length || 0 })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 relative overflow-hidden", children: data && ((0,jsx_runtime.jsx)(SankeyDiagram, { nodes: data.nodes, links: data.links, onNodeClick: handleNodeClick, onNodeHover: handleNodeHover })) }), hoveredNode && ((0,jsx_runtime.jsxs)("div", { className: "absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 max-w-sm", children: [(0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white mb-2", children: hoveredNode.name }), (0,jsx_runtime.jsxs)("div", { className: "space-y-1 text-sm", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between", children: [(0,jsx_runtime.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Type:" }), (0,jsx_runtime.jsx)("span", { className: "text-gray-900 dark:text-white capitalize", children: hoveredNode.type.replace('-', ' ') })] }), hoveredNode.factSheet.baseInfo.description && ((0,jsx_runtime.jsx)("div", { className: "pt-2 border-t border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: hoveredNode.factSheet.baseInfo.description }) }))] })] }))] }));
};
/* harmony default export */ const organisation_OrganisationMapView = (OrganisationMapView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RCxtQkFBSSxXQUFXLHVFQUF1RSxHQUFHLG1CQUFJLFdBQVcsK0hBQStILElBQUksR0FBRyxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxXQUFXLHVFQUF1RSxHQUFHLG1CQUFJLFdBQVcsZ0lBQWdJLElBQUksR0FBRyxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxXQUFXLDBFQUEwRSxHQUFHLG1CQUFJLFdBQVcsbUlBQW1JLElBQUksR0FBRyxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxXQUFXLDBFQUEwRSxHQUFHLG1CQUFJLFdBQVcsa0lBQWtJLElBQUksSUFBSSxHQUFHLEdBQUcsbUJBQUksVUFBVSxpRUFBaUUsbUJBQUksQ0FBQyxhQUFhLElBQUksa0dBQWtHLElBQUksbUJBQW1CLG9CQUFLLFVBQVUsMkpBQTJKLG1CQUFJLFNBQVMsMkZBQTJGLEdBQUcsb0JBQUssVUFBVSwyQ0FBMkMsb0JBQUssVUFBVSw4Q0FBOEMsbUJBQUksV0FBVyxrRUFBa0UsR0FBRyxtQkFBSSxXQUFXLHFHQUFxRyxJQUFJLGtEQUFrRCxtQkFBSSxVQUFVLDJFQUEyRSxtQkFBSSxRQUFRLHFHQUFxRyxHQUFHLEtBQUssSUFBSSxLQUFLO0FBQzl6STtBQUNBLHVFQUFlLG1CQUFtQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlT3JnYW5pc2F0aW9uTWFwTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvU2Fua2V5RGlhZ3JhbS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3Mvb3JnYW5pc2F0aW9uL09yZ2FuaXNhdGlvbk1hcFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogdXNlT3JnYW5pc2F0aW9uTWFwTG9naWMgSG9va1xuICpcbiAqIERhdGEgYWdncmVnYXRpb24gbG9naWMgZm9yIE9yZ2FuaXNhdGlvbiBNYXAgZmVhdHVyZS5cbiAqIFJlYWRzIGFsbCBDU1YgZmlsZXMgZnJvbSBkaXNjb3ZlcnkgbW9kdWxlcyBhbmQgY29uc3RydWN0cyBTYW5rZXkgZGlhZ3JhbSBkYXRhLlxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuZXhwb3J0IGNvbnN0IHVzZU9yZ2FuaXNhdGlvbk1hcExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgZmV0Y2hEYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VPcmdhbmlzYXRpb25NYXBMb2dpY10gU3RhcnRpbmcgZGF0YSBmZXRjaC4uLicpO1xuICAgICAgICAgICAgLy8gR2V0IGFsbCBDU1YgZmlsZXMgZnJvbSBkaXNjb3ZlcnkgZGF0YVxuICAgICAgICAgICAgY29uc3QgY3N2RmlsZXMgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuaW52b2tlKCdnZXQtZGlzY292ZXJ5LWZpbGVzJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3VzZU9yZ2FuaXNhdGlvbk1hcExvZ2ljXSBGb3VuZCBDU1YgZmlsZXM6JywgY3N2RmlsZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgZWFjaCBDU1YgZmlsZVxuICAgICAgICAgICAgY29uc3QgYWxsTm9kZXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGFsbExpbmtzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgY3N2RmlsZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW3VzZU9yZ2FuaXNhdGlvbk1hcExvZ2ljXSBQcm9jZXNzaW5nIGZpbGU6JywgZmlsZS5wYXRoLCAnVHlwZTonLCBmaWxlLnR5cGUpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuaW52b2tlKCdyZWFkLWRpc2NvdmVyeS1maWxlJywgZmlsZS5wYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZU5vZGVzID0gcGFyc2VDU1ZUb05vZGVzKGNvbnRlbnQsIGZpbGUudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVMaW5rcyA9IGdlbmVyYXRlTGlua3NGb3JGaWxlKGZpbGVOb2RlcywgZmlsZS50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VPcmdhbmlzYXRpb25NYXBMb2dpY10gRmlsZSBwYXJzZWQ6Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXM6IGZpbGVOb2Rlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rczogZmlsZUxpbmtzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYWxsTm9kZXMucHVzaCguLi5maWxlTm9kZXMpO1xuICAgICAgICAgICAgICAgICAgICBhbGxMaW5rcy5wdXNoKC4uLmZpbGVMaW5rcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChmaWxlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdXNlT3JnYW5pc2F0aW9uTWFwTG9naWNdIEZhaWxlZCB0byBwcm9jZXNzIGZpbGU6JywgZmlsZS5wYXRoLCBmaWxlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdXNlT3JnYW5pc2F0aW9uTWFwTG9naWNdIFRvdGFsIGJlZm9yZSBtZXJnZTonLCB7XG4gICAgICAgICAgICAgICAgbm9kZXM6IGFsbE5vZGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsaW5rczogYWxsTGlua3MubGVuZ3RoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIE1lcmdlIGR1cGxpY2F0ZSBub2RlcyBhbmQgbGlua3NcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZERhdGEgPSBtZXJnZUR1cGxpY2F0ZUVudGl0aWVzKGFsbE5vZGVzLCBhbGxMaW5rcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3VzZU9yZ2FuaXNhdGlvbk1hcExvZ2ljXSBUb3RhbCBhZnRlciBtZXJnZTonLCB7XG4gICAgICAgICAgICAgICAgbm9kZXM6IG1lcmdlZERhdGEubm9kZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxpbmtzOiBtZXJnZWREYXRhLmxpbmtzLmxlbmd0aFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXREYXRhKG1lcmdlZERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t1c2VPcmdhbmlzYXRpb25NYXBMb2dpY10gRXJyb3IgZmV0Y2hpbmcgb3JnYW5pc2F0aW9uIG1hcCBkYXRhOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIGRhdGEnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaERhdGEoKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgcmVmZXRjaCA9ICgpID0+IHtcbiAgICAgICAgZmV0Y2hEYXRhKCk7XG4gICAgfTtcbiAgICByZXR1cm4geyBkYXRhLCBsb2FkaW5nLCBlcnJvciwgcmVmZXRjaCB9O1xufTtcbi8qKlxuICogUGFyc2UgQ1NWIGNvbnRlbnQgdG8gU2Fua2V5Tm9kZSBhcnJheVxuICovXG5mdW5jdGlvbiBwYXJzZUNTVlRvTm9kZXMoY3N2Q29udGVudCwgZmlsZVR5cGUpIHtcbiAgICBjb25zdCBsaW5lcyA9IGNzdkNvbnRlbnQuc3BsaXQoJ1xcbicpLmZpbHRlcihsaW5lID0+IGxpbmUudHJpbSgpKTtcbiAgICBpZiAobGluZXMubGVuZ3RoIDwgMilcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGNvbnN0IGhlYWRlcnMgPSBsaW5lc1swXS5zcGxpdCgnLCcpLm1hcChoID0+IGgudHJpbSgpLnJlcGxhY2UoL1wiL2csICcnKSk7XG4gICAgY29uc3Qgcm93cyA9IGxpbmVzLnNsaWNlKDEpO1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgcm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IHJvdy5zcGxpdCgnLCcpLm1hcCh2ID0+IHYudHJpbSgpLnJlcGxhY2UoL1wiL2csICcnKSk7XG4gICAgICAgIGNvbnN0IHJlY29yZCA9IHt9O1xuICAgICAgICBoZWFkZXJzLmZvckVhY2goKGhlYWRlciwgaSkgPT4ge1xuICAgICAgICAgICAgcmVjb3JkW2hlYWRlcl0gPSB2YWx1ZXNbaV0gfHwgJyc7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlTm9kZUZyb21SZWNvcmQocmVjb3JkLCBmaWxlVHlwZSwgaW5kZXgpO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBub2Rlcy5maWx0ZXIoQm9vbGVhbik7XG59XG4vKipcbiAqIENyZWF0ZSBTYW5rZXlOb2RlIGZyb20gQ1NWIHJlY29yZFxuICogQ1JJVElDQUw6IFVzZSBQYXNjYWxDYXNlIHByb3BlcnR5IG5hbWVzIHRvIG1hdGNoIFBvd2VyU2hlbGwgb3V0cHV0XG4gKiBXb3JrcyB3aXRoIGFjdHVhbCBkaXNjb3ZlcnkgZGF0YSAoVXNlcnMsIEdyb3VwcywgRGV2aWNlcywgTWFpbGJveGVzLCBldGMuKVxuICovXG5mdW5jdGlvbiBjcmVhdGVOb2RlRnJvbVJlY29yZChyZWNvcmQsIGZpbGVUeXBlLCBpbmRleCkge1xuICAgIC8vIE1hcCBmaWxlIHR5cGVzIHRvIGVudGl0eSB0eXBlcyBhbmQgZXh0cmFjdCByZWxldmFudCBmaWVsZHNcbiAgICBjb25zdCB0eXBlTWFwcGluZyA9IHtcbiAgICAgICAgJ3VzZXInOiB7XG4gICAgICAgICAgICB0eXBlOiAnYXBwbGljYXRpb24nLCAvLyBVc2VycyBhcyBhcHBsaWNhdGlvbnMgZm9yIHZpc3VhbGl6YXRpb25cbiAgICAgICAgICAgIGdldE5hbWU6IChyKSA9PiByLkRpc3BsYXlOYW1lIHx8IHIuVXNlclByaW5jaXBhbE5hbWUgfHwgci5TYW1BY2NvdW50TmFtZSB8fCByLk5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgJ2dyb3VwJzoge1xuICAgICAgICAgICAgdHlwZTogJ3BsYXRmb3JtJywgLy8gR3JvdXBzIGFzIHBsYXRmb3Jtc1xuICAgICAgICAgICAgZ2V0TmFtZTogKHIpID0+IHIuRGlzcGxheU5hbWUgfHwgci5OYW1lIHx8IHIuR3JvdXBOYW1lXG4gICAgICAgIH0sXG4gICAgICAgICdtYWlsYm94Jzoge1xuICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uJyxcbiAgICAgICAgICAgIGdldE5hbWU6IChyKSA9PiByLkRpc3BsYXlOYW1lIHx8IHIuUHJpbWFyeVNtdHBBZGRyZXNzIHx8IHIuTmFtZVxuICAgICAgICB9LFxuICAgICAgICAnZGV2aWNlJzoge1xuICAgICAgICAgICAgdHlwZTogJ2l0LWNvbXBvbmVudCcsXG4gICAgICAgICAgICBnZXROYW1lOiAocikgPT4gci5OYW1lIHx8IHIuQ29tcHV0ZXJOYW1lIHx8IHIuRGV2aWNlTmFtZSB8fCByLkRpc3BsYXlOYW1lXG4gICAgICAgIH0sXG4gICAgICAgICdzZXJ2ZXInOiB7XG4gICAgICAgICAgICB0eXBlOiAnaXQtY29tcG9uZW50JyxcbiAgICAgICAgICAgIGdldE5hbWU6IChyKSA9PiByLk5hbWUgfHwgci5TZXJ2ZXJOYW1lIHx8IHIuQ29tcHV0ZXJOYW1lXG4gICAgICAgIH0sXG4gICAgICAgICdhcHBsaWNhdGlvbic6IHtcbiAgICAgICAgICAgIHR5cGU6ICdhcHBsaWNhdGlvbicsXG4gICAgICAgICAgICBnZXROYW1lOiAocikgPT4gci5OYW1lIHx8IHIuRGlzcGxheU5hbWUgfHwgci5BcHBsaWNhdGlvbk5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgJ2luZnJhc3RydWN0dXJlJzoge1xuICAgICAgICAgICAgdHlwZTogJ2RhdGFjZW50ZXInLFxuICAgICAgICAgICAgZ2V0TmFtZTogKHIpID0+IHIuTmFtZSB8fCByLkRpc3BsYXlOYW1lXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IG1hcHBpbmcgPSB0eXBlTWFwcGluZ1tmaWxlVHlwZS50b0xvd2VyQ2FzZSgpXTtcbiAgICBpZiAoIW1hcHBpbmcpIHtcbiAgICAgICAgLy8gVW5rbm93biB0eXBlLCBza2lwXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBuYW1lID0gbWFwcGluZy5nZXROYW1lKHJlY29yZCk7XG4gICAgaWYgKCFuYW1lIHx8IG5hbWUudHJpbSgpID09PSAnJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgbm9kZVR5cGUgPSBtYXBwaW5nLnR5cGU7XG4gICAgY29uc3QgdW5pcXVlSWQgPSBgJHtub2RlVHlwZX0tJHtuYW1lfS0ke2luZGV4fWA7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHVuaXF1ZUlkLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICB0eXBlOiBub2RlVHlwZSxcbiAgICAgICAgZmFjdFNoZWV0OiBjcmVhdGVGYWN0U2hlZXQocmVjb3JkLCBub2RlVHlwZSksXG4gICAgICAgIG1ldGFkYXRhOiB7IHNvdXJjZTogZmlsZVR5cGUsIHJlY29yZCB9XG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlIEZhY3RTaGVldCBmcm9tIENTViByZWNvcmRcbiAqIENSSVRJQ0FMOiBVc2UgUGFzY2FsQ2FzZSBwcm9wZXJ0eSBuYW1lc1xuICovXG5mdW5jdGlvbiBjcmVhdGVGYWN0U2hlZXQocmVjb3JkLCB0eXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmFzZUluZm86IHtcbiAgICAgICAgICAgIG5hbWU6IHJlY29yZC5OYW1lIHx8IHJlY29yZC5EaXNwbGF5TmFtZSB8fCByZWNvcmQuQXBwbGljYXRpb25OYW1lIHx8ICdVbmtub3duJyxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogcmVjb3JkLkRlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICAgICAgb3duZXI6IHJlY29yZC5Pd25lciB8fCByZWNvcmQuTWFuYWdlckRpc3BsYXlOYW1lIHx8ICcnLFxuICAgICAgICAgICAgc3RhdHVzOiAocmVjb3JkLlN0YXR1cyB8fCAnYWN0aXZlJykudG9Mb3dlckNhc2UoKVxuICAgICAgICB9LFxuICAgICAgICByZWxhdGlvbnM6IHtcbiAgICAgICAgICAgIGluY29taW5nOiBbXSxcbiAgICAgICAgICAgIG91dGdvaW5nOiBbXVxuICAgICAgICB9LFxuICAgICAgICBpdENvbXBvbmVudHM6IFtdLFxuICAgICAgICBzdWJzY3JpcHRpb25zOiBbXSxcbiAgICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgICB0b2RvczogW10sXG4gICAgICAgIHJlc291cmNlczogW10sXG4gICAgICAgIG1ldHJpY3M6IFtdLFxuICAgICAgICBzdXJ2ZXlzOiBbXSxcbiAgICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUocmVjb3JkLkxhc3RNb2RpZmllZCB8fCByZWNvcmQuQ3JlYXRlZERhdGVUaW1lIHx8IERhdGUubm93KCkpXG4gICAgfTtcbn1cbi8qKlxuICogR2VuZXJhdGUgbGlua3MgYmV0d2VlbiBub2RlcyBiYXNlZCBvbiBoaWVyYXJjaGljYWwgcmVsYXRpb25zaGlwc1xuICogV29ya3Mgd2l0aCBhY3R1YWwgZGlzY292ZXJ5IGRhdGEgcmVsYXRpb25zaGlwcyAodXNlcnPihpJncm91cHMsIGRldmljZXPihpJzZXJ2ZXJzLCBldGMuKVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUxpbmtzRm9yRmlsZShub2RlcywgZmlsZVR5cGUpIHtcbiAgICBjb25zdCBsaW5rcyA9IFtdO1xuICAgIC8vIENyZWF0ZSByZWxhdGlvbnNoaXBzIGJhc2VkIG9uIGRpc2NvdmVyZWQgZGF0YVxuICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY29yZCA9IG5vZGUubWV0YWRhdGEucmVjb3JkO1xuICAgICAgICAvLyBMaW5rIHVzZXJzIHRvIGdyb3VwcyB0aGV5IGJlbG9uZyB0b1xuICAgICAgICBpZiAoZmlsZVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ3VzZXInICYmIHJlY29yZC5Hcm91cHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VwcyA9IEFycmF5LmlzQXJyYXkocmVjb3JkLkdyb3VwcykgPyByZWNvcmQuR3JvdXBzIDogW3JlY29yZC5Hcm91cHNdO1xuICAgICAgICAgICAgZ3JvdXBzLmZvckVhY2goKGdyb3VwTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChncm91cE5hbWUgJiYgZ3JvdXBOYW1lLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIG1hdGNoaW5nIGdyb3VwIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JvdXBOb2RlID0gbm9kZXMuZmluZChuID0+IG4udHlwZSA9PT0gJ3BsYXRmb3JtJyAmJiBuLm5hbWUgPT09IGdyb3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChncm91cE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZ3JvdXBOb2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogbm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbWVtYmVyc2hpcCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTGluayBtYWlsYm94ZXMgdG8gdXNlcnMgKGJ5IG1hdGNoaW5nIG5hbWVzL1VQTnMpXG4gICAgICAgIGlmIChmaWxlVHlwZS50b0xvd2VyQ2FzZSgpID09PSAnbWFpbGJveCcgJiYgcmVjb3JkLlVzZXJQcmluY2lwYWxOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VyTm9kZSA9IG5vZGVzLmZpbmQobiA9PiBuLnR5cGUgPT09ICdhcHBsaWNhdGlvbicgJiZcbiAgICAgICAgICAgICAgICAobi5tZXRhZGF0YS5yZWNvcmQuVXNlclByaW5jaXBhbE5hbWUgPT09IHJlY29yZC5Vc2VyUHJpbmNpcGFsTmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBuLm1ldGFkYXRhLnJlY29yZC5EaXNwbGF5TmFtZSA9PT0gcmVjb3JkLkRpc3BsYXlOYW1lKSk7XG4gICAgICAgICAgICBpZiAodXNlck5vZGUpIHtcbiAgICAgICAgICAgICAgICBsaW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB1c2VyTm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ293bmVyc2hpcCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBMaW5rIGRldmljZXMgdG8gc2VydmVycyBvciBpbmZyYXN0cnVjdHVyZVxuICAgICAgICBpZiAoZmlsZVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2RldmljZScgJiYgcmVjb3JkLlNlcnZlck5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlck5vZGUgPSBub2Rlcy5maW5kKG4gPT4gbi50eXBlID09PSAnaXQtY29tcG9uZW50JyAmJiBuLm5hbWUgPT09IHJlY29yZC5TZXJ2ZXJOYW1lKTtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgbGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogc2VydmVyTm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RlcGxveW1lbnQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlua3M7XG59XG4vKipcbiAqIE1lcmdlIGR1cGxpY2F0ZSBub2RlcyBhbmQgbGlua3NcbiAqL1xuZnVuY3Rpb24gbWVyZ2VEdXBsaWNhdGVFbnRpdGllcyhub2RlcywgbGlua3MpIHtcbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlIG5vZGVzIGJ5IElEXG4gICAgY29uc3QgdW5pcXVlTm9kZXMgPSBub2Rlcy5yZWR1Y2UoKGFjYywgbm9kZSkgPT4ge1xuICAgICAgICBpZiAoIWFjYy5maW5kKG4gPT4gbi5pZCA9PT0gbm9kZS5pZCkpIHtcbiAgICAgICAgICAgIGFjYy5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgW10pO1xuICAgIC8vIFJlbW92ZSBkdXBsaWNhdGUgbGlua3NcbiAgICBjb25zdCB1bmlxdWVMaW5rcyA9IGxpbmtzLnJlZHVjZSgoYWNjLCBsaW5rKSA9PiB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUlkID0gdHlwZW9mIGxpbmsuc291cmNlID09PSAnc3RyaW5nJyA/IGxpbmsuc291cmNlIDogbGluay5zb3VyY2UuaWQ7XG4gICAgICAgIGNvbnN0IHRhcmdldElkID0gdHlwZW9mIGxpbmsudGFyZ2V0ID09PSAnc3RyaW5nJyA/IGxpbmsudGFyZ2V0IDogbGluay50YXJnZXQuaWQ7XG4gICAgICAgIGlmICghYWNjLmZpbmQobCA9PiB7XG4gICAgICAgICAgICBjb25zdCBsU291cmNlSWQgPSB0eXBlb2YgbC5zb3VyY2UgPT09ICdzdHJpbmcnID8gbC5zb3VyY2UgOiBsLnNvdXJjZS5pZDtcbiAgICAgICAgICAgIGNvbnN0IGxUYXJnZXRJZCA9IHR5cGVvZiBsLnRhcmdldCA9PT0gJ3N0cmluZycgPyBsLnRhcmdldCA6IGwudGFyZ2V0LmlkO1xuICAgICAgICAgICAgcmV0dXJuIGxTb3VyY2VJZCA9PT0gc291cmNlSWQgJiYgbFRhcmdldElkID09PSB0YXJnZXRJZDtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgICAgIGFjYy5wdXNoKGxpbmspO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgW10pO1xuICAgIHJldHVybiB7IG5vZGVzOiB1bmlxdWVOb2RlcywgbGlua3M6IHVuaXF1ZUxpbmtzIH07XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTYW5rZXlEaWFncmFtIENvbXBvbmVudFxuICpcbiAqIEludGVyYWN0aXZlIEQzLmpzLXBvd2VyZWQgU2Fua2V5IGRpYWdyYW0gZm9yIE9yZ2FuaXphdGlvbiBNYXAgdmlzdWFsaXphdGlvbi5cbiAqIERpc3BsYXlzIGhpZXJhcmNoaWNhbCByZWxhdGlvbnNoaXBzIGJldHdlZW4gZW50aXRpZXMgd2l0aCBmbG93LWJhc2VkIGxheW91dC5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0Jztcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSBkMyB0eXBlcyBub3QgaW5zdGFsbGVkLCBydW50aW1lIGZ1bmN0aW9uYWxpdHkgd29ya3NcbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSBkMy1zYW5rZXkgdHlwZXMgbm90IGluc3RhbGxlZCwgcnVudGltZSBmdW5jdGlvbmFsaXR5IHdvcmtzXG5pbXBvcnQgeyBzYW5rZXksIHNhbmtleUxpbmtIb3Jpem9udGFsIH0gZnJvbSAnZDMtc2Fua2V5Jztcbi8vIFR5cGUgY29sb3IgbWFwcGluZyBmb3IgZW50aXRpZXNcbmNvbnN0IFRZUEVfQ09MT1JTID0ge1xuICAgICdjb21wYW55JzogJyMzYjgyZjYnLCAvLyBibHVlLTUwMFxuICAgICdwbGF0Zm9ybSc6ICcjOGI1Y2Y2JywgLy8gdmlvbGV0LTUwMFxuICAgICdhcHBsaWNhdGlvbic6ICcjMTBiOTgxJywgLy8gZW1lcmFsZC01MDBcbiAgICAnZGF0YWNlbnRlcic6ICcjZjU5ZTBiJywgLy8gYW1iZXItNTAwXG4gICAgJ3Byb3ZpZGVyLWludGVyZmFjZSc6ICcjMDZiNmQ0JywgLy8gY3lhbi01MDBcbiAgICAnY29uc3VtZXItaW50ZXJmYWNlJzogJyNlYzQ4OTknLCAvLyBwaW5rLTUwMFxuICAgICdidXNpbmVzcy1jYXBhYmlsaXR5JzogJyM2MzY2ZjEnLCAvLyBpbmRpZ28tNTAwXG4gICAgJ2l0LWNvbXBvbmVudCc6ICcjODRjYzE2JywgLy8gbGltZS01MDBcbn07XG5leHBvcnQgY29uc3QgU2Fua2V5RGlhZ3JhbSA9ICh7IG5vZGVzLCBsaW5rcywgd2lkdGggPSAxMjAwLCBoZWlnaHQgPSA2MDAsIG9uTm9kZUNsaWNrLCBvbk5vZGVIb3ZlciwgfSkgPT4ge1xuICAgIGNvbnN0IHN2Z1JlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbaG92ZXJlZE5vZGUsIHNldEhvdmVyZWROb2RlXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghc3ZnUmVmLmN1cnJlbnQgfHwgbm9kZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZygnW1NhbmtleURpYWdyYW1dIFJlbmRlcmluZzonLCB7IG5vZGVzOiBub2Rlcy5sZW5ndGgsIGxpbmtzOiBsaW5rcy5sZW5ndGggfSk7XG4gICAgICAgIC8vIENsZWFyIHByZXZpb3VzIGNvbnRlbnRcbiAgICAgICAgZDMuc2VsZWN0KHN2Z1JlZi5jdXJyZW50KS5zZWxlY3RBbGwoJyonKS5yZW1vdmUoKTtcbiAgICAgICAgLy8gQ3JlYXRlIFNWRyBjb250YWluZXJcbiAgICAgICAgY29uc3Qgc3ZnID0gZDMuc2VsZWN0KHN2Z1JlZi5jdXJyZW50KVxuICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuICAgICAgICAgICAgLmF0dHIoJ3ZpZXdCb3gnLCBgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWApXG4gICAgICAgICAgICAuc3R5bGUoJ2JhY2tncm91bmQnLCAndHJhbnNwYXJlbnQnKTtcbiAgICAgICAgLy8gQWRkIHpvb20gYmVoYXZpb3JcbiAgICAgICAgY29uc3QgZyA9IHN2Zy5hcHBlbmQoJ2cnKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IGQzLnpvb20oKVxuICAgICAgICAgICAgLnNjYWxlRXh0ZW50KFswLjEsIDRdKVxuICAgICAgICAgICAgLm9uKCd6b29tJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIGV2ZW50LnRyYW5zZm9ybSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzdmcuY2FsbCh6b29tKTtcbiAgICAgICAgLy8gUHJlcGFyZSBkYXRhIGZvciBkMy1zYW5rZXlcbiAgICAgICAgY29uc3Qgc2Fua2V5R2VuZXJhdG9yID0gc2Fua2V5KClcbiAgICAgICAgICAgIC5ub2RlSWQoKGQpID0+IGQuaWQpXG4gICAgICAgICAgICAubm9kZVdpZHRoKDE1KVxuICAgICAgICAgICAgLm5vZGVQYWRkaW5nKDEwKVxuICAgICAgICAgICAgLmV4dGVudChbWzEsIDFdLCBbd2lkdGggLSAxLCBoZWlnaHQgLSA2XV0pO1xuICAgICAgICAvLyBDcmVhdGUgYSBjb3B5IG9mIHRoZSBkYXRhIGZvciBkMy1zYW5rZXkgKGl0IG11dGF0ZXMgdGhlIG9iamVjdHMpXG4gICAgICAgIGNvbnN0IGdyYXBoRGF0YSA9IHtcbiAgICAgICAgICAgIG5vZGVzOiBub2Rlcy5tYXAobiA9PiAoeyAuLi5uIH0pKSxcbiAgICAgICAgICAgIGxpbmtzOiBsaW5rcy5tYXAobCA9PiAoeyAuLi5sIH0pKVxuICAgICAgICB9O1xuICAgICAgICAvLyBWYWxpZGF0ZSBkYXRhIGJlZm9yZSBnZW5lcmF0aW5nIGxheW91dFxuICAgICAgICBpZiAoZ3JhcGhEYXRhLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU2Fua2V5RGlhZ3JhbV0gTm8gbm9kZXMgdG8gcmVuZGVyJyk7XG4gICAgICAgICAgICBnLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCB3aWR0aCAvIDIpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3knLCBoZWlnaHQgLyAyKVxuICAgICAgICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJyM5Y2EzYWYnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAnMTZweCcpXG4gICAgICAgICAgICAgICAgLnRleHQoJ05vIGVudGl0aWVzIHRvIGRpc3BsYXknKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBGaWx0ZXIgb3V0IGxpbmtzIHRoYXQgcmVmZXJlbmNlIG5vbi1leGlzdGVudCBub2Rlc1xuICAgICAgICBjb25zdCBub2RlSWRzID0gbmV3IFNldChncmFwaERhdGEubm9kZXMubWFwKG4gPT4gbi5pZCkpO1xuICAgICAgICBjb25zdCB2YWxpZExpbmtzID0gZ3JhcGhEYXRhLmxpbmtzLmZpbHRlcihsID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUlkID0gdHlwZW9mIGwuc291cmNlID09PSAnc3RyaW5nJyA/IGwuc291cmNlIDogbC5zb3VyY2UuaWQ7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJZCA9IHR5cGVvZiBsLnRhcmdldCA9PT0gJ3N0cmluZycgPyBsLnRhcmdldCA6IGwudGFyZ2V0LmlkO1xuICAgICAgICAgICAgY29uc3QgdmFsaWQgPSBub2RlSWRzLmhhcyhzb3VyY2VJZCkgJiYgbm9kZUlkcy5oYXModGFyZ2V0SWQpO1xuICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1NhbmtleURpYWdyYW1dIFNraXBwaW5nIGludmFsaWQgbGluazonLCBzb3VyY2VJZCwgJy0+JywgdGFyZ2V0SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgICB9KTtcbiAgICAgICAgZ3JhcGhEYXRhLmxpbmtzID0gdmFsaWRMaW5rcztcbiAgICAgICAgY29uc29sZS5sb2coJ1tTYW5rZXlEaWFncmFtXSBWYWxpZGF0ZWQgZGF0YTonLCB7XG4gICAgICAgICAgICBub2RlczogZ3JhcGhEYXRhLm5vZGVzLmxlbmd0aCxcbiAgICAgICAgICAgIHZhbGlkTGlua3M6IHZhbGlkTGlua3MubGVuZ3RoLFxuICAgICAgICAgICAgaW52YWxpZExpbmtzOiBsaW5rcy5sZW5ndGggLSB2YWxpZExpbmtzLmxlbmd0aFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gSWYgbm8gbGlua3MsIHVzZSBncmlkIGxheW91dCBpbnN0ZWFkIG9mIFNhbmtleVxuICAgICAgICBpZiAodmFsaWRMaW5rcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW1NhbmtleURpYWdyYW1dIE5vIGxpbmtzIGZvdW5kLCB1c2luZyBncmlkIGxheW91dCcpO1xuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGdyaWQgZGltZW5zaW9uc1xuICAgICAgICAgICAgY29uc3Qgbm9kZUNvdW50ID0gZ3JhcGhEYXRhLm5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGNvbHMgPSBNYXRoLmNlaWwoTWF0aC5zcXJ0KG5vZGVDb3VudCkpO1xuICAgICAgICAgICAgY29uc3Qgcm93cyA9IE1hdGguY2VpbChub2RlQ291bnQgLyBjb2xzKTtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxXaWR0aCA9ICh3aWR0aCAtIDQwKSAvIGNvbHM7XG4gICAgICAgICAgICBjb25zdCBjZWxsSGVpZ2h0ID0gKGhlaWdodCAtIDQwKSAvIHJvd3M7XG4gICAgICAgICAgICBjb25zdCBub2RlV2lkdGggPSAxNTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVIZWlnaHQgPSAzMDtcbiAgICAgICAgICAgIC8vIFBvc2l0aW9uIG5vZGVzIGluIGEgZ3JpZFxuICAgICAgICAgICAgZ3JhcGhEYXRhLm5vZGVzLmZvckVhY2goKG5vZGUsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2wgPSBpICUgY29scztcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBjb2xzKTtcbiAgICAgICAgICAgICAgICBub2RlLngwID0gMjAgKyBjb2wgKiBjZWxsV2lkdGg7XG4gICAgICAgICAgICAgICAgbm9kZS55MCA9IDIwICsgcm93ICogY2VsbEhlaWdodDtcbiAgICAgICAgICAgICAgICBub2RlLngxID0gbm9kZS54MCArIG5vZGVXaWR0aDtcbiAgICAgICAgICAgICAgICBub2RlLnkxID0gbm9kZS55MCArIG5vZGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IDE7XG4gICAgICAgICAgICAgICAgbm9kZS5zb3VyY2VMaW5rcyA9IFtdO1xuICAgICAgICAgICAgICAgIG5vZGUudGFyZ2V0TGlua3MgPSBbXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBncmlkZGVkIGRhdGEgYXMgc2Fua2V5RGF0YVxuICAgICAgICAgICAgY29uc3Qgc2Fua2V5RGF0YSA9IHsgbm9kZXM6IGdyYXBoRGF0YS5ub2RlcywgbGlua3M6IFtdIH07XG4gICAgICAgICAgICAvLyBEcmF3IG5vZGVzIG9ubHkgKG5vIGxpbmtzIHRvIGRyYXcpXG4gICAgICAgICAgICBjb25zdCBub2RlID0gZy5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlcycpXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnZycpXG4gICAgICAgICAgICAgICAgLmRhdGEoc2Fua2V5RGF0YS5ub2RlcylcbiAgICAgICAgICAgICAgICAuam9pbignZycpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ25vZGUnKTtcbiAgICAgICAgICAgIC8vIEFkZCBub2RlIHJlY3RhbmdsZXNcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgICAuYXR0cigneCcsIChkKSA9PiBkLngwKVxuICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgKGQpID0+IGQueTApXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIChkKSA9PiBkLnkxIC0gZC55MClcbiAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAoZCkgPT4gZC54MSAtIGQueDApXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAoZCkgPT4gVFlQRV9DT0xPUlNbZC50eXBlXSB8fCAnIzZiNzI4MCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgMilcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ2N1cnNvcicsICdwb2ludGVyJylcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbiAoZXZlbnQsIGQpIHtcbiAgICAgICAgICAgICAgICBzZXRIb3ZlcmVkTm9kZShkLmlkKTtcbiAgICAgICAgICAgICAgICBpZiAob25Ob2RlSG92ZXIpXG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZUhvdmVyKGQpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdzdHJva2UnLCAnI2ZiYmYyNCcpLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDMpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZXZlbnQsIGQpIHtcbiAgICAgICAgICAgICAgICBzZXRIb3ZlcmVkTm9kZShudWxsKTtcbiAgICAgICAgICAgICAgICBpZiAob25Ob2RlSG92ZXIpXG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZUhvdmVyKG51bGwpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdzdHJva2UnLCAnI2ZmZicpLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50LCBkKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9uTm9kZUNsaWNrKVxuICAgICAgICAgICAgICAgICAgICBvbk5vZGVDbGljayhkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQWRkIG5vZGUgbGFiZWxzXG4gICAgICAgICAgICBub2RlLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAoZCkgPT4gZC54MCA8IHdpZHRoIC8gMiA/IGQueDEgKyA2IDogZC54MCAtIDYpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAoZCkgPT4gKGQueTEgKyBkLnkwKSAvIDIpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgJzAuMzVlbScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgKGQpID0+IGQueDAgPCB3aWR0aCAvIDIgPyAnc3RhcnQnIDogJ2VuZCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcxMHB4JylcbiAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICcjMzc0MTUxJylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKVxuICAgICAgICAgICAgICAgIC50ZXh0KChkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gMjA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQubmFtZS5sZW5ndGggPiBtYXhMZW5ndGggPyBkLm5hbWUuc3Vic3RyaW5nKDAsIG1heExlbmd0aCkgKyAnLi4uJyA6IGQubmFtZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQWRkIHRvb2x0aXBzIGZvciBncmlkIGxheW91dFxuICAgICAgICAgICAgY29uc3QgdG9vbHRpcCA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnZGl2JylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnc2Fua2V5LXRvb2x0aXAtZ3JpZCcpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdiYWNrZ3JvdW5kJywgJ3JnYmEoMCwgMCwgMCwgMC44KScpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdjb2xvcicsICcjZmZmJylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BhZGRpbmcnLCAnOHB4IDEycHgnKVxuICAgICAgICAgICAgICAgIC5zdHlsZSgnYm9yZGVyLXJhZGl1cycsICc0cHgnKVxuICAgICAgICAgICAgICAgIC5zdHlsZSgnZm9udC1zaXplJywgJzEycHgnKVxuICAgICAgICAgICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMClcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3otaW5kZXgnLCAxMDAwMCk7XG4gICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQsIGQpIHtcbiAgICAgICAgICAgICAgICB0b29sdGlwXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDEpXG4gICAgICAgICAgICAgICAgICAgIC5odG1sKGA8c3Ryb25nPiR7ZC5uYW1lfTwvc3Ryb25nPjxici8+VHlwZTogJHtkLnR5cGV9YClcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCdsZWZ0JywgKGV2ZW50LnBhZ2VYICsgMTApICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKCd0b3AnLCAoZXZlbnQucGFnZVkgLSAyOCkgKyAncHgnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0b29sdGlwLnN0eWxlKCdvcGFjaXR5JywgMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2VuZXJhdGUgc2Fua2V5IGxheW91dCAod2hlbiB3ZSBoYXZlIGxpbmtzKVxuICAgICAgICBsZXQgc2Fua2V5RGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNhbmtleURhdGEgPSBzYW5rZXlHZW5lcmF0b3IoZ3JhcGhEYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU2Fua2V5RGlhZ3JhbV0gTGF5b3V0IGNvbXB1dGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgLy8gVmFsaWRhdGUgbGF5b3V0IG91dHB1dFxuICAgICAgICAgICAgY29uc3QgaGFzSW52YWxpZFBvc2l0aW9ucyA9IHNhbmtleURhdGEubm9kZXMuc29tZSgobikgPT4gaXNOYU4obi54MCkgfHwgaXNOYU4obi55MCkgfHwgaXNOYU4obi54MSkgfHwgaXNOYU4obi55MSkpO1xuICAgICAgICAgICAgaWYgKGhhc0ludmFsaWRQb3NpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheW91dCBwcm9kdWNlZCBOYU4gY29vcmRpbmF0ZXMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTYW5rZXlEaWFncmFtXSBMYXlvdXQgY29tcHV0YXRpb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIFNob3cgZXJyb3IgbWVzc2FnZSBpbiBTVkdcbiAgICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgICAgICAuYXR0cigneCcsIHdpZHRoIC8gMilcbiAgICAgICAgICAgICAgICAuYXR0cigneScsIGhlaWdodCAvIDIpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnI2VmNDQ0NCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcxNnB4JylcbiAgICAgICAgICAgICAgICAudGV4dCgnVW5hYmxlIHRvIGNvbXB1dGUgZGlhZ3JhbSBsYXlvdXQuIENoZWNrIGNvbnNvbGUgZm9yIGRldGFpbHMuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJhdyBsaW5rcyAoZmxvd3MpXG4gICAgICAgIGNvbnN0IGxpbmsgPSBnLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGlua3MnKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAgICAgICAuZGF0YShzYW5rZXlEYXRhLmxpbmtzKVxuICAgICAgICAgICAgLmpvaW4oJ3BhdGgnKVxuICAgICAgICAgICAgLmF0dHIoJ2QnLCBzYW5rZXlMaW5rSG9yaXpvbnRhbCgpKVxuICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsIChkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VOb2RlID0gZC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gVFlQRV9DT0xPUlNbc291cmNlTm9kZS50eXBlXSB8fCAnIzljYTNhZic7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgKGQpID0+IE1hdGgubWF4KDEsIGQud2lkdGgpKVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAgICAgICAuYXR0cignb3BhY2l0eScsIDAuMylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgICAgICAgIC5zdHlsZSgnbWl4LWJsZW5kLW1vZGUnLCAnbXVsdGlwbHknKTtcbiAgICAgICAgLy8gQWRkIGxpbmsgaG92ZXIgZWZmZWN0XG4gICAgICAgIGxpbmtcbiAgICAgICAgICAgIC5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uIChldmVudCwgZCkge1xuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ29wYWNpdHknLCAwLjYpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIChkKSA9PiBNYXRoLm1heCgyLCBkLndpZHRoICsgMikpO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ29wYWNpdHknLCAwLjMpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIChkKSA9PiBNYXRoLm1heCgxLCBkLndpZHRoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBEcmF3IG5vZGVzXG4gICAgICAgIGNvbnN0IG5vZGUgPSBnLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbm9kZXMnKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnZycpXG4gICAgICAgICAgICAuZGF0YShzYW5rZXlEYXRhLm5vZGVzKVxuICAgICAgICAgICAgLmpvaW4oJ2cnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ25vZGUnKTtcbiAgICAgICAgLy8gQWRkIG5vZGUgcmVjdGFuZ2xlc1xuICAgICAgICBub2RlLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAuYXR0cigneCcsIChkKSA9PiBkLngwKVxuICAgICAgICAgICAgLmF0dHIoJ3knLCAoZCkgPT4gZC55MClcbiAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAoZCkgPT4gZC55MSAtIGQueTApXG4gICAgICAgICAgICAuYXR0cignd2lkdGgnLCAoZCkgPT4gZC54MSAtIGQueDApXG4gICAgICAgICAgICAuYXR0cignZmlsbCcsIChkKSA9PiBUWVBFX0NPTE9SU1tkLnR5cGVdIHx8ICcjNmI3MjgwJylcbiAgICAgICAgICAgIC5hdHRyKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgMilcbiAgICAgICAgICAgIC5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKVxuICAgICAgICAgICAgLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24gKGV2ZW50LCBkKSB7XG4gICAgICAgICAgICBzZXRIb3ZlcmVkTm9kZShkLmlkKTtcbiAgICAgICAgICAgIGlmIChvbk5vZGVIb3ZlcilcbiAgICAgICAgICAgICAgICBvbk5vZGVIb3ZlcihkKTtcbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCBjb25uZWN0ZWQgbGlua3NcbiAgICAgICAgICAgIGxpbmsuYXR0cignb3BhY2l0eScsIChsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChsLnNvdXJjZS5pZCA9PT0gZC5pZCB8fCBsLnRhcmdldC5pZCA9PT0gZC5pZCkgPyAwLjYgOiAwLjE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCBub2RlXG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJyNmYmJmMjQnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAzKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uIChldmVudCwgZCkge1xuICAgICAgICAgICAgc2V0SG92ZXJlZE5vZGUobnVsbCk7XG4gICAgICAgICAgICBpZiAob25Ob2RlSG92ZXIpXG4gICAgICAgICAgICAgICAgb25Ob2RlSG92ZXIobnVsbCk7XG4gICAgICAgICAgICAvLyBSZXNldCBsaW5rIG9wYWNpdHlcbiAgICAgICAgICAgIGxpbmsuYXR0cignb3BhY2l0eScsIDAuMyk7XG4gICAgICAgICAgICAvLyBSZXNldCBub2RlIHN0cm9rZVxuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgMik7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50LCBkKSB7XG4gICAgICAgICAgICBpZiAob25Ob2RlQ2xpY2spXG4gICAgICAgICAgICAgICAgb25Ob2RlQ2xpY2soZCk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBBZGQgbm9kZSBsYWJlbHNcbiAgICAgICAgbm9kZS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCAoZCkgPT4gZC54MCA8IHdpZHRoIC8gMiA/IGQueDEgKyA2IDogZC54MCAtIDYpXG4gICAgICAgICAgICAuYXR0cigneScsIChkKSA9PiAoZC55MSArIGQueTApIC8gMilcbiAgICAgICAgICAgIC5hdHRyKCdkeScsICcwLjM1ZW0nKVxuICAgICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgKGQpID0+IGQueDAgPCB3aWR0aCAvIDIgPyAnc3RhcnQnIDogJ2VuZCcpXG4gICAgICAgICAgICAuYXR0cignZm9udC1zaXplJywgJzEycHgnKVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnIzM3NDE1MScpXG4gICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKVxuICAgICAgICAgICAgLnRleHQoKGQpID0+IHtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIGxvbmcgbmFtZXNcbiAgICAgICAgICAgIGNvbnN0IG1heExlbmd0aCA9IDMwO1xuICAgICAgICAgICAgcmV0dXJuIGQubmFtZS5sZW5ndGggPiBtYXhMZW5ndGggPyBkLm5hbWUuc3Vic3RyaW5nKDAsIG1heExlbmd0aCkgKyAnLi4uJyA6IGQubmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFkZCB0b29sdGlwc1xuICAgICAgICBjb25zdCB0b29sdGlwID0gZDMuc2VsZWN0KCdib2R5JylcbiAgICAgICAgICAgIC5hcHBlbmQoJ2RpdicpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnc2Fua2V5LXRvb2x0aXAnKVxuICAgICAgICAgICAgLnN0eWxlKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpXG4gICAgICAgICAgICAuc3R5bGUoJ2JhY2tncm91bmQnLCAncmdiYSgwLCAwLCAwLCAwLjgpJylcbiAgICAgICAgICAgIC5zdHlsZSgnY29sb3InLCAnI2ZmZicpXG4gICAgICAgICAgICAuc3R5bGUoJ3BhZGRpbmcnLCAnOHB4IDEycHgnKVxuICAgICAgICAgICAgLnN0eWxlKCdib3JkZXItcmFkaXVzJywgJzRweCcpXG4gICAgICAgICAgICAuc3R5bGUoJ2ZvbnQtc2l6ZScsICcxMnB4JylcbiAgICAgICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpXG4gICAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwKVxuICAgICAgICAgICAgLnN0eWxlKCd6LWluZGV4JywgMTAwMDApO1xuICAgICAgICBub2RlXG4gICAgICAgICAgICAub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCwgZCkge1xuICAgICAgICAgICAgdG9vbHRpcFxuICAgICAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDEpXG4gICAgICAgICAgICAgICAgLmh0bWwoYFxyXG4gICAgICAgICAgICA8c3Ryb25nPiR7ZC5uYW1lfTwvc3Ryb25nPjxici8+XHJcbiAgICAgICAgICAgIFR5cGU6ICR7ZC50eXBlfTxici8+XHJcbiAgICAgICAgICAgIENvbm5lY3Rpb25zOiAkeyhkLnNvdXJjZUxpbmtzPy5sZW5ndGggfHwgMCkgKyAoZC50YXJnZXRMaW5rcz8ubGVuZ3RoIHx8IDApfVxyXG4gICAgICAgICAgYClcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ2xlZnQnLCAoZXZlbnQucGFnZVggKyAxMCkgKyAncHgnKVxuICAgICAgICAgICAgICAgIC5zdHlsZSgndG9wJywgKGV2ZW50LnBhZ2VZIC0gMjgpICsgJ3B4Jyk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZSgnb3BhY2l0eScsIDApO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gQ2xlYW51cCB0b29sdGlwIG9uIHVubW91bnRcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlKCk7XG4gICAgICAgIH07XG4gICAgfSwgW25vZGVzLCBsaW5rcywgd2lkdGgsIGhlaWdodCwgb25Ob2RlQ2xpY2ssIG9uTm9kZUhvdmVyXSk7XG4gICAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciB0ZXh0LWdyYXktNTAwXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIG1iLTJcIiwgY2hpbGRyZW46IFwiTm8gRGF0YSBBdmFpbGFibGVcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogXCJSdW4gZGlzY292ZXJ5IG1vZHVsZXMgdG8gcG9wdWxhdGUgdGhlIG9yZ2FuaXphdGlvbiBtYXAuXCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB3LWZ1bGwgaC1mdWxsIG92ZXJmbG93LWhpZGRlbiBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgY2hpbGRyZW46IFtfanN4KFwic3ZnXCIsIHsgcmVmOiBzdmdSZWYsIGNsYXNzTmFtZTogXCJ3LWZ1bGwgaC1mdWxsXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC00IHJpZ2h0LTQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy1sZyBwLTQgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgbWItMiB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJFbnRpdHkgVHlwZXNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTFcIiwgY2hpbGRyZW46IE9iamVjdC5lbnRyaWVzKFRZUEVfQ09MT1JTKS5tYXAoKFt0eXBlLCBjb2xvcl0pID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy0zIGgtMyByb3VuZGVkXCIsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogY29sb3IgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBjYXBpdGFsaXplXCIsIGNoaWxkcmVuOiB0eXBlLnJlcGxhY2UoJy0nLCAnICcpIH0pXSB9LCB0eXBlKSkpIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBib3R0b20tNCBsZWZ0LTQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy1sZyBwLTMgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4KFwic3Ryb25nXCIsIHsgY2hpbGRyZW46IFwiVGlwOlwiIH0pLCBcIiBIb3ZlciBvdmVyIG5vZGVzIHRvIGhpZ2hsaWdodCBjb25uZWN0aW9ucy4gQ2xpY2sgdG8gdmlldyBkZXRhaWxzLiBTY3JvbGwgdG8gem9vbS5cIl0gfSkgfSldIH0pKTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBPcmdhbmlzYXRpb24gTWFwIFZpZXdcbiAqXG4gKiBMZWFuSVgtc3R5bGUgRW50ZXJwcmlzZSBBcmNoaXRlY3R1cmUgdmlzdWFsaXphdGlvbiB3aXRoIGludGVyYWN0aXZlIFNhbmtleSBkaWFncmFtLlxuICogQWdncmVnYXRlcyBhbGwgZGlzY292ZXJ5IGRhdGEgdG8gc2hvdyByZWxhdGlvbnNoaXBzIGJldHdlZW4gZW50aXRpZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU9yZ2FuaXNhdGlvbk1hcExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlT3JnYW5pc2F0aW9uTWFwTG9naWMnO1xuaW1wb3J0IHsgU2Fua2V5RGlhZ3JhbSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1NhbmtleURpYWdyYW0nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU3Bpbm5lcic7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBOZXR3b3JrLCBSZWZyZXNoQ3csIERvd25sb2FkLCBab29tSW4sIFpvb21PdXQsIFNlYXJjaCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5leHBvcnQgY29uc3QgT3JnYW5pc2F0aW9uTWFwVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIGxvYWRpbmcsIGVycm9yLCByZWZldGNoIH0gPSB1c2VPcmdhbmlzYXRpb25NYXBMb2dpYygpO1xuICAgIGNvbnN0IFtzZWxlY3RlZE5vZGUsIHNldFNlbGVjdGVkTm9kZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaG92ZXJlZE5vZGUsIHNldEhvdmVyZWROb2RlXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnNvbGUubG9nKCdbT3JnYW5pc2F0aW9uTWFwVmlld10gUmVuZGVyOicsIHsgbG9hZGluZywgZXJyb3IsIG5vZGVzOiBkYXRhPy5ub2Rlcy5sZW5ndGgsIGxpbmtzOiBkYXRhPy5saW5rcy5sZW5ndGggfSk7XG4gICAgY29uc3QgaGFuZGxlTm9kZUNsaWNrID0gKG5vZGUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tPcmdhbmlzYXRpb25NYXBWaWV3XSBOb2RlIGNsaWNrZWQ6Jywgbm9kZSk7XG4gICAgICAgIHNldFNlbGVjdGVkTm9kZShub2RlKTtcbiAgICAgICAgLy8gVE9ETzogT3BlbiBmYWN0IHNoZWV0IG1vZGFsXG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVOb2RlSG92ZXIgPSAobm9kZSkgPT4ge1xuICAgICAgICBzZXRIb3ZlcmVkTm9kZShub2RlKTtcbiAgICB9O1xuICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLXNjcmVlbiBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBvcmdhbmlzYXRpb24gbWFwIGRhdGEuLi5cIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwibXQtNCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJBbmFseXppbmcgZGlzY292ZXJ5IGRhdGEgZnJvbSBhbGwgc291cmNlcy4uLlwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIGlmIChlcnJvcikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1zY3JlZW4gYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBtYXgtdy1tZFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1iLTRcIiwgY2hpbGRyZW46IF9qc3goTmV0d29yaywgeyBzaXplOiA0OCwgY2xhc3NOYW1lOiBcIm14LWF1dG9cIiB9KSB9KSwgX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi0yXCIsIGNoaWxkcmVuOiBcIkZhaWxlZCB0byBMb2FkIE9yZ2FuaXNhdGlvbiBNYXBcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbWItNlwiLCBjaGlsZHJlbjogZXJyb3IgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IHJlZmV0Y2gsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IHNpemU6IDE2IH0pLCBjaGlsZHJlbjogXCJSZXRyeVwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1zY3JlZW4gZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KE5ldHdvcmssIHsgc2l6ZTogMjQsIGNsYXNzTmFtZTogXCJ0ZXh0LWJsdWUtNjAwXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIk9yZ2FuaXNhdGlvbiBNYXBcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJFbnRlcnByaXNlIEFyY2hpdGVjdHVyZSBWaXN1YWxpemF0aW9uXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChTZWFyY2gsIHsgc2l6ZTogMTYgfSksIHRpdGxlOiBcIlNlYXJjaCBlbnRpdGllc1wiLCBjaGlsZHJlbjogXCJTZWFyY2hcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goWm9vbUluLCB7IHNpemU6IDE2IH0pLCB0aXRsZTogXCJab29tIGluXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFpvb21PdXQsIHsgc2l6ZTogMTYgfSksIHRpdGxlOiBcIlpvb20gb3V0XCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCB0aXRsZTogXCJFeHBvcnQgZGlhZ3JhbVwiLCBjaGlsZHJlbjogXCJFeHBvcnRcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiByZWZldGNoLCB0aXRsZTogXCJSZWZyZXNoIGRhdGFcIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pXSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS0zXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNiB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJFbnRpdGllczpcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogZGF0YT8ubm9kZXMubGVuZ3RoIHx8IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlJlbGF0aW9uc2hpcHM6XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGRhdGE/LmxpbmtzLmxlbmd0aCB8fCAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJDb21wYW5pZXM6XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGRhdGE/Lm5vZGVzLmZpbHRlcihuID0+IG4udHlwZSA9PT0gJ2NvbXBhbnknKS5sZW5ndGggfHwgMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiUGxhdGZvcm1zOlwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBkYXRhPy5ub2Rlcy5maWx0ZXIobiA9PiBuLnR5cGUgPT09ICdwbGF0Zm9ybScpLmxlbmd0aCB8fCAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJBcHBsaWNhdGlvbnM6XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGRhdGE/Lm5vZGVzLmZpbHRlcihuID0+IG4udHlwZSA9PT0gJ2FwcGxpY2F0aW9uJykubGVuZ3RoIHx8IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkRhdGEgQ2VudGVyczpcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogZGF0YT8ubm9kZXMuZmlsdGVyKG4gPT4gbi50eXBlID09PSAnZGF0YWNlbnRlcicpLmxlbmd0aCB8fCAwIH0pXSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogZGF0YSAmJiAoX2pzeChTYW5rZXlEaWFncmFtLCB7IG5vZGVzOiBkYXRhLm5vZGVzLCBsaW5rczogZGF0YS5saW5rcywgb25Ob2RlQ2xpY2s6IGhhbmRsZU5vZGVDbGljaywgb25Ob2RlSG92ZXI6IGhhbmRsZU5vZGVIb3ZlciB9KSkgfSksIGhvdmVyZWROb2RlICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBib3R0b20tMjAgbGVmdC00IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cteGwgcC00IGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgbWF4LXctc21cIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi0yXCIsIGNoaWxkcmVuOiBob3ZlcmVkTm9kZS5uYW1lIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTEgdGV4dC1zbVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiVHlwZTpcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgY2FwaXRhbGl6ZVwiLCBjaGlsZHJlbjogaG92ZXJlZE5vZGUudHlwZS5yZXBsYWNlKCctJywgJyAnKSB9KV0gfSksIGhvdmVyZWROb2RlLmZhY3RTaGVldC5iYXNlSW5mby5kZXNjcmlwdGlvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwdC0yIGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGhvdmVyZWROb2RlLmZhY3RTaGVldC5iYXNlSW5mby5kZXNjcmlwdGlvbiB9KSB9KSldIH0pXSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBPcmdhbmlzYXRpb25NYXBWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9