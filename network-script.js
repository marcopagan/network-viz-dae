// GET TOOLTIP
let tooltip = document.querySelector("#network-tooltip");
let spanName = document.createElement("span");
spanName.id = "tlp-name";
tooltip.appendChild(spanName);
let spanDesc = document.createElement("span");
spanDesc.id = "tlp-desc";
tooltip.appendChild(spanDesc);
let spanLoc = document.createElement("span");
spanLoc.id = "tlp-loc";
tooltip.appendChild(spanLoc);
let spanCollab = document.createElement("span");
spanCollab.id = "tlp-collab";
tooltip.appendChild(spanCollab);

// GET LEGEND
let legendTitle = document.querySelector("#legend-title");
let legendOp1 = document.querySelector("#legend-op1");
let legendOp2 = document.querySelector("#legend-op2");
let legendOp3 = document.querySelector("#legend-op3");
let legendOp4Box = document.querySelector("#legend-op4-box");
let legendOp4 = document.querySelector("#legend-op4");

// GET SELECT
let nSelect = document.querySelector("#network-select");
nSelect.addEventListener('change',function(){
    let vizType = nSelect.value;
    displayNetwork(vizType);
});

// FIRST DRAW
displayNetwork('byloc');

function displayNetwork(kind) {
    const wrapper = document.querySelector("#network-wrapper");
    wrapper.innerHTML = ""
    if(kind == "byloc"){
        legendTitle.innerHTML = "Partner type";
        legendOp1.innerHTML = "Industry";
        legendOp2.innerHTML = "Educational";
        legendOp3.innerHTML = "Governmental Institutions";
        legendOp4Box.style.display = "flex";
        legendOp4.innerHTML = "Design Stakeholders";







        d3.json("byloc.json").then(function(data) {
            // CONSTANTS
            const width = 2400;
            const height = 1600;
            const margin = 20;
            const cwhite = "#D5CDDD";
            const clight = "#bca5ce";
            const cmid = "#734E8F";
            const cdark = "#281933";
            const tooltip = d3.select("#network-tooltip");
            const tlpName = d3.select("#tlp-name");
            const tlpLoc = d3.select("#tlp-loc");
            const tlpDesc = d3.select("#tlp-desc");
            const tlpCollab = d3.select("#tlp-collab");
          
            const colorByType = {
              "Industry": "#a5b4ce",
              "Educational": "#bca5ce",
              "Governmental Institutions": "#e5e4c1",
              "Design Stakeholders": "#e29ece"
            };
          
            // PACKING
            const pack = data => d3.pack()
            .size([width - margin * 2, height - margin * 2])
            .padding(16)
            (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));
            const root = pack(data);
          
            // SVG SETTINGS
            const svg = d3.select("#network-wrapper").append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("viewBox", [-margin, -margin, width, height])
              .attr("style", `width: 100%; height: auto; font: 16px Helvetica, sans-serif; font-weight: bold; max-width: 1200px`)
              .attr("text-anchor", "middle");
          
            // CREATING Gs
            const node = svg.append("g")
              .selectAll("g")
              .data(root.descendants())
              .join("g")
              .attr("transform", d => `translate(${d.x},${d.y})`);
          
            // CREATING CIRCLES
            const circles = node.append("circle")
              .attr("r", d => d.r)
              .attr("fill", d => {
                const typeNode = d.ancestors().find(a => a.data.type);
                const topType = typeNode ? typeNode.data.type : null;
                return d.children ? cwhite : colorByType[topType] || clight;
              })
              .attr("stroke", d => d.children ? cmid : cdark)
              .attr("stroke-width", "1px")
              .on("mouseover", function(event, d) {
                handleMouseOver(event, d, d3.select(this));
              })
              .on("mousemove", handleMouseMove)
              .on("mouseout", function(event, d) {
                handleMouseOut(event, d, d3.select(this));
              });
          
            // ADDING STATIC LABELS TO MAIN GROUPS
            const groupLabels = node
              .filter(d => ["international", "national", "local"].includes(d.data.type))
              .append("text")
              .attr("dy", d => d.r - 10)
              .attr("dx", d => 0)
              .text(d => d.data.type.toUpperCase())
              .style("fill", cmid)
              .style("font-size", "16px")
              .style("text-anchor", "middle")
              .style("pointer-events", "none");
          
          
          
          
            // ADDING THE TEXT LABELS
            const labels = node.filter(d => !d.children).append("text")
              .attr("dy", "0.3em")
              //.text(d => d.data.name)
              .text(function(d) {
                let text = d.data.name;
                let reducedText = d.data.name.substring(0, d.r / 5);
                if(reducedText != text){
                  reducedText += "…";
                }
                return reducedText;
              })
              .style("text-anchor", "middle")
              .style("fill", cdark)
              .on("mouseover", function(event, d) {
                let circle = d3.select(this.parentNode).select("circle");
                handleMouseOver(event, d3.select(this.parentNode).datum(), circle);
              })
              .on("mousemove", function(event) {
                handleMouseMove(event);
              })
              .on("mouseout", function(event, d) {
                let circle = d3.select(this.parentNode).select("circle");
                handleMouseOut(event, d3.select(this.parentNode).datum(), circle);
              });
          
          
          
          
            // FUNCTIONS
            function handleMouseOver(event, d, element) {
              if (d.data.name != undefined) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 1);
                tooltip
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
                tlpName.html(d.data.name);
                tlpLoc.html(d.data.location);
                tlpDesc.html(d.data.type)
                .style("text-decoration", "underline")
                .style("text-decoration-color", colorByType[d.data.type]);
                if(d.data.collab == ""){
                  tlpCollab.style("display", "none")
                  tlpCollab.html("")
                }else{
                  tlpCollab.style("display", "unset")
                  tlpCollab.html(d.data.collab);
                }
              }
              element.attr("fill", d => d.children ? cwhite : cmid)
            }
          
            function handleMouseMove(event) {
              tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
          
            function handleMouseOut(event, d, element) {
              tooltip.transition()
                .duration(200)
                .style("opacity", 0);
              
              element.attr("fill", d => {
                const typeNode = d.ancestors().find(a => a.data.type);
                const topType = typeNode ? typeNode.data.type : null;
                return d.children ? cwhite : colorByType[topType] || clight;
              })
            }
          
            return svg.node();
          });




    }else{
        legendTitle.innerHTML = "Partner location";
        legendOp1.innerHTML = "International";
        legendOp2.innerHTML = "National";
        legendOp3.innerHTML = "Local";
        legendOp4Box.style.display = "none";
        legendOp4.innerHTML = "Null";





        d3.json("bytype.json").then(function(data) {
            // CONSTANTS
            const width = 2400;
            const height = 1600;
            const margin = 20;
            const cwhite = "#D5CDDD";
            const clight = "#bca5ce";
            const cmid = "#734E8F";
            const cdark = "#281933";
            const tooltip = d3.select("#network-tooltip");
            const tlpName = d3.select("#tlp-name");
            const tlpLoc = d3.select("#tlp-loc");
            const tlpDesc = d3.select("#tlp-desc");
            const tlpCollab = d3.select("#tlp-collab");
        
            const colorByType = {
              "international": "#a5b4ce",
              "national": "#bca5ce",
              "local": "#e5e4c1",
              "Extra": "#e29ece"
            };
        
            // PACKING
            const pack = data => d3.pack()
            .size([width - margin * 2, height - margin * 2])
            .padding(16)
            (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));
            const root = pack(data);
        
            // SVG SETTINGS
            const svg = d3.select("#network-wrapper").append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("viewBox", [-margin, -margin, width, height])
              .attr("style", `width: 100%; height: auto; font: 16px Helvetica, sans-serif; font-weight: bold; max-width: 1200px`)
              .attr("text-anchor", "middle");
        
            // CREATING Gs
            const node = svg.append("g")
              .selectAll("g")
              .data(root.descendants())
              .join("g")
              .attr("transform", d => `translate(${d.x},${d.y})`);
        
            // CREATING CIRCLES
            const circles = node.append("circle")
              .attr("r", d => d.r)
              .attr("fill", d => {
                const typeNode = d.find(a => a.data.kind);
                const topType = typeNode ? typeNode.data.kind : null;
                return d.children ? cwhite : colorByType[topType] || clight;
              })
              //.attr("fill", d => d.children ? cwhite : clight)
              .attr("stroke", d => d.children ? cmid : cdark)
              .attr("stroke-width", "1px")
              .on("mouseover", function(event, d) {
                handleMouseOver(event, d, d3.select(this));
              })
              .on("mousemove", handleMouseMove)
              .on("mouseout", function(event, d) {
                handleMouseOut(event, d, d3.select(this));
              });
        
            // ADDING STATIC LABELS TO MAIN GROUPS
            const groupLabels = node
              .filter(d => d.children ? ["Industry", "Educational", "Governmental Institutions", "Design Stakeholders"].includes(d.data.type) : null)
              .append("text")
              .attr("dy", d => -d.r - 10)
              .attr("dx", d => 0)
              .text(d => d.data.type.toUpperCase())
              .style("fill", cmid)
              .style("font-size", "16px")
              .style("text-anchor", "middle")
              .style("pointer-events", "none");
        
        
        
        
            // ADDING THE TEXT LABELS
            const labels = node.filter(d => !d.children).append("text")
              .attr("dy", "0.3em")
              //.text(d => d.data.name)
              .text(function(d) {
                let text = d.data.name;
                let reducedText = d.data.name.substring(0, d.r / 5);
                if(reducedText != text){
                  reducedText += "…";
                }
                return reducedText;
              })
              .style("text-anchor", "middle")
              .style("fill", cdark)
              .on("mouseover", function(event, d) {
                let circle = d3.select(this.parentNode).select("circle");
                handleMouseOver(event, d3.select(this.parentNode).datum(), circle);
              })
              .on("mousemove", function(event) {
                handleMouseMove(event);
              })
              .on("mouseout", function(event, d) {
                let circle = d3.select(this.parentNode).select("circle");
                handleMouseOut(event, d3.select(this.parentNode).datum(), circle);
              });
        
        
        
        
            // FUNCTIONS
            function handleMouseOver(event, d, element) {
              if (d.data.name != undefined) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 1);
                tooltip
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
                tlpName.html(d.data.name);
                tlpLoc.html(d.data.location);
                tlpDesc.html(d.data.type)
                tlpCollab.html(d.data.collab);
              }
              element.attr("fill", d => d.children ? cwhite : cmid)
            }
        
            function handleMouseMove(event) {
              tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
        
            function handleMouseOut(event, d, element) {
              tooltip.transition()
                .duration(200)
                .style("opacity", 0);
              
              element.attr("fill", d => {
                const typeNode = d.find(a => a.data.kind);
                const topType = typeNode ? typeNode.data.kind : null;
                return d.children ? cwhite : colorByType[topType] || clight;
              })
            }
        
            return svg.node();
          });



    }
}










// SAVING EVENT AND FUNCTION
document.addEventListener('keydown', function(event) {
  if (event.key === 'e') {
    console.log("Saving SVG...");
    exportSVG();
  }
});
function exportSVG() {
const svgElement = document.querySelector("#network-wrapper svg");
if (svgElement) {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = "network_visualization.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
  console.log("SVG export complete.");
} else {
  console.error("Cannot find SVG element.");
}
}