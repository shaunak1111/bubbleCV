// Fake JSON data
let data = [
{
    cat: 'css', name: 'sass', value: 8,
    icon: 'img/sass.png',
    desc: `
        Good experience in using sass was involved in
        designing the css architecture using sass from scratch.
    `
},
{
    cat: 'editor', name: 'Sublime', value: 7,
    icon: 'img/sublime.png',
    desc: `
        Frequently use for sublime text web development.
        Installed typescript plug in.
    `
},
{
    cat: 'language', name: 'Javascript', value: 8.5,
    icon: 'img/sass.png',
    desc: `
        Good experience in javascript for 3.5 years
        Proficient in OOJS and es5 and es6.
    `
},
{
    cat: 'framework', name: 'angular1.x', value: 8,
    icon: 'img/angular1.png',
    desc: `
        2 years experience in angular1.x (need some revision)
        comfortable in writing directives, controller and services.
    `
},
{
    cat: 'framework', name: 'angular2/4.x', value: 8,
    icon: 'img/angular2.png',
    desc: `
        2 years experience in angular1.x (need some revision)
        comfortable in writing directives, controller and services.
    `
},
{
    cat: 'framework', name: 'node', value: 8,
    icon: 'img/node.png',
    desc: `
        1.5 years in writing restful API'S using node.js using express.
        Used async library handling asynchronous requests.
    `
},
{
    cat: 'source-version', name: 'Git', value: 8,
    icon: 'img/git.jpg',
    desc: `
        Exclusively worked in git, using source tree git manager.
        Experience in working using github and atlassian bitbucket.
        Contributed to open source http://github.com/shaunak1111
    `
},
{
    cat: 'framework', name: 'HTML5', value: 7,
    icon: 'img/html5.png',
    desc: `
        Have used various HTML5 API'S.
        Mainly used session storage and local storage.
    `
},
{
    cat: 'task-runner', name: 'Gulp', value: 6,
    icon: 'img/gulp.png',
    desc: `
        Intermediate experience in gulp.
        Used in when contributing to open-source angular material project
        and hosted this D3.js app.`
}
];

/*eslint-enable indent*/
/*global d3*/
let svg = d3.select('#teck-stack-svg');
let width = svg.property('clientWidth'); // get width in pixels
let height = +svg.attr('height');
let centerX = width * 0.5;
let centerY = height * 0.5;
let strength = 0.05;
let focusedNode;
console.log('width', width);

let format = d3.format(',d');

let scaleColor = d3.scaleOrdinal(d3.schemeCategory20);

// use pack to calculate radius of the circle
let pack = d3.pack()
    .size([width, height ])
    .padding(1.5);

let forceCollide = d3.forceCollide(d => d.r + 1);

// use the force
let simulation = d3.forceSimulation()
    // .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('collide', forceCollide)
    // .force('center', d3.forceCenter(centerX, centerY))
    .force('x', d3.forceX(centerX ).strength(strength))
    .force('y', d3.forceY(centerY ).strength(strength));

// reduce number of circles on mobile screen due to slow computation
if ('matchMedia' in window && window.matchMedia('(max-device-width: 767px)').matches) {
    data = data.filter(el => {
        return el.value >= 50;
    });
}

let root = d3.hierarchy({ children: data })
    .sum(d => d.value);

// we use pack() to automatically calculate radius conveniently only
// and get only the leaves
let nodes = pack(root).leaves().map(node => {
    // console.log('node:', node.x, (node.x - centerX) * 2);
    const data = node.data;
    return {
        x: centerX + (node.x - centerX) * 3, // magnify start position to have transition to center movement
        y: centerY + (node.y - centerY) * 3,
        r: 0, // for tweening
        radius: node.r, //original radius
        id: data.cat + '.' + (data.name.replace(/\s/g, '-')),
        cat: data.cat,
        name: data.name,
        value: data.value,
        icon: data.icon,
        desc: data.desc,
    };
});
simulation.nodes(nodes).on('tick', ticked);

svg.style('background-color', '#eee');
let node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('g')
    .attr('class', 'node')
    .call(d3.drag()
        .on('start', (d) => {
            if (!d3.event.active) { simulation.alphaTarget(0.2).restart(); }
            d.fx = d.x;
            d.fy = d.y;
        })
        .on('drag', (d) => {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        })
        .on('end', (d) => {
            if (!d3.event.active) { simulation.alphaTarget(0); }
            d.fx = null;
            d.fy = null;
        }));

node.append('circle')
    .attr('id', d => d.id)
    .attr('r', 0)
    .style('fill', d => scaleColor(d.cat))
    .transition().duration(2000).ease(d3.easeElasticOut)
        .tween('circleIn', (d) => {
            let i = d3.interpolateNumber(0, d.radius);
            return (t) => {
                d.r = i(t);
                simulation.force('collide', forceCollide);
            };
        });

node.append('clipPath')
    .attr('id', d => `clip-${d.id}`)
    .append('use')
    .attr('xlink:href', d => `#${d.id}`);

// display text as circle icon
node.filter(d => !String(d.icon).includes('img/'))
    .append('text')
    .classed('node-icon', true)
    .attr('clip-path', d => `url(#clip-${d.id})`)
    .selectAll('tspan')
    .data(d => d.icon.split(';'))
    .enter()
        .append('tspan')
        .attr('x', 0)
        .attr('y', (d, i, nodes) => (13 + (i - nodes.length / 2 - 0.5) * 10))
        .text(name => name);

// display image as circle icon
node.filter(d => String(d.icon).includes('img/'))
    .append('image')
    .classed('node-icon', true)
    .attr('clip-path', d => `url(#clip-${d.id})`)
    .attr('xlink:href', d => d.icon)
    .attr('x', d => -d.radius * 0.5)
    .attr('y', d => -d.radius * 0.5)
    .attr('height', d => d.radius * 2 * 0.5)
    .attr('width', d => d.radius * 2 * 0.5);

node.append('title')
    .text(d => (d.cat + '::' + d.name + '\n' + format(d.value)));

let legendOrdinal = d3.legendColor()
    .scale(scaleColor)
    .shape('circle');

// legend 1
// svg.append('g')
//     .classed('legend-color', true)
//     .attr('text-anchor', 'start')
//     .attr('transform', 'translate(20,30)')
//     .style('font-size', '12px')
//     .call(legendOrdinal);

// let sizeScale = d3.scaleOrdinal()
//     .domain(['less use', 'more use'])
//     .range([5, 10] );

// let legendSize = d3.legendSize()
//     .scale(sizeScale)
//     .shape('circle')
//     .shapePadding(10)
//     .labelAlign('end');

// legend 2
// svg.append('g')
//     .classed('legend-size', true)
//     .attr('text-anchor', 'start')
//     .attr('transform', 'translate(150, 25)')
//     .style('font-size', '12px')
//     .call(legendSize);


/*
<foreignObject class="circle-overlay" x="10" y="10" width="100" height="150">
    <div class="circle-overlay__inner">
        <h2 class="circle-overlay__title">ReactJS</h2>
        <p class="circle-overlay__body">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam, sunt, aspernatur. Autem repudiandae, laboriosam. Nulla quidem nihil aperiam dolorem repellendus pariatur, quaerat sed eligendi inventore ipsa natus fugiat soluta doloremque!</p>
    </div>
</foreignObject>
*/
let infoBox = node.append('foreignObject')
    .classed('circle-overlay hidden', true)
    .attr('x', -350 * 0.5 * 0.8)
    .attr('y', -350 * 0.5 * 0.8)
    .attr('height', 350 * 0.8)
    .attr('width', 350 * 0.8)
        .append('xhtml:div')
        .classed('circle-overlay__inner', true);

infoBox.append('h2')
    .classed('circle-overlay__title', true)
    .text(d => d.name);

infoBox.append('p')
    .classed('circle-overlay__body', true)
    .html(d => d.desc);


node.on('click', (currentNode) => {
    d3.event.stopPropagation();
    console.log('currentNode', currentNode);
    let currentTarget = d3.event.currentTarget; // the <g> el

    if (currentNode === focusedNode) {
        // no focusedNode or same focused node is clicked
        return;
    }

    let lastNode = focusedNode;
    focusedNode = currentNode;

    simulation.alphaTarget(0.2).restart();
    // hide all circle-overlay
    d3.selectAll('.circle-overlay').classed('hidden', true);
    d3.selectAll('.node-icon').classed('node-icon--faded', false);

    // don't fix last node to center anymore
    if (lastNode) {
        lastNode.fx = null;
        lastNode.fy = null;
        node.filter((d, i) => i === lastNode.index)
            .transition().duration(2000).ease(d3.easePolyOut)
            .tween('circleOut', () => {
                let irl = d3.interpolateNumber(lastNode.r, lastNode.radius);
                return (t) => {
                    lastNode.r = irl(t);
                };
            })
            .on('interrupt', () => {
                lastNode.r = lastNode.radius;
            });
    }

    // if (!d3.event.active) simulation.alphaTarget(0.5).restart();

    d3.transition().duration(2000).ease(d3.easePolyOut)
        .tween('moveIn', () => {
            console.log('tweenMoveIn', currentNode);
            let ix = d3.interpolateNumber(currentNode.x, centerX);
            let iy = d3.interpolateNumber(currentNode.y, centerY);
            let ir = d3.interpolateNumber(currentNode.r, centerY * 0.5);
            return function (t) {
                // console.log('i', ix(t), iy(t));
                currentNode.fx = ix(t);
                currentNode.fy = iy(t);
                currentNode.r = ir(t);
                simulation.force('collide', forceCollide);
            };
        })
        .on('end', () => {
            simulation.alphaTarget(0);
            let $currentGroup = d3.select(currentTarget);
            $currentGroup.select('.circle-overlay')
                .classed('hidden', false);
            $currentGroup.select('.node-icon')
                .classed('node-icon--faded', true);

        })
        .on('interrupt', () => {
            console.log('move interrupt', currentNode);
            currentNode.fx = null;
            currentNode.fy = null;
            simulation.alphaTarget(0);
        });

});

// blur
d3.select(document).on('click', () => {
    let target = d3.event.target;
    // check if click on document but not on the circle overlay
    if (!target.closest('#circle-overlay') && focusedNode) {
        focusedNode.fx = null;
        focusedNode.fy = null;
        simulation.alphaTarget(0.2).restart();
        d3.transition().duration(2000).ease(d3.easePolyOut)
            .tween('moveOut', function () {
                console.log('tweenMoveOut', focusedNode);
                let ir = d3.interpolateNumber(focusedNode.r, focusedNode.radius);
                return function (t) {
                    focusedNode.r = ir(t);
                    simulation.force('collide', forceCollide);
                };
            })
            .on('end', () => {
                focusedNode = null;
                simulation.alphaTarget(0);
            })
            .on('interrupt', () => {
                simulation.alphaTarget(0);
            });

        // hide all circle-overlay
        d3.selectAll('.circle-overlay').classed('hidden', true);
        d3.selectAll('.node-icon').classed('node-icon--faded', false);
    }
});

function ticked() {
    node
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .select('circle')
            .attr('r', d => d.r);
}
