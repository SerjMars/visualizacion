// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 30, left: 50, right: 15, bottom: 120 }

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// II. Variables globales
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

y = d3.scaleLinear()
          .range([alto, 0])

x = d3.scaleBand()
      .range([0, ancho])
      .paddingInner(0.1)
      .paddingOuter(0.3)

color = d3.scaleOrdinal()
          .range(d3.schemePaired)

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

titulo = g.append('text')
          .attr('x', `${ancho * 3 / 4}px`)
          .attr('y', '-5px')
          .attr('text-anchor', 'middle')
          .text('CONSTRUCTORES DE FÓRMULA 1')
          .attr('class', 'titulo-grafica')

dataArray = []


analisis = 'carreras'
analisisSelect = d3.select('#analisis')

ascendente = false

// III. render (update o dibujo)
function render(data) {
  bars = g.selectAll('rect')
            .data(data, d => d.constructor)

  bars.enter()
      .append('rect')
        .style('width', '0px')
        .style('height', '0px')
        .style('y', `${y(0)}px`)
        .style('fill', '#000')
        .style('x', d => x(d.constructor) + 'px')
      .merge(bars)
        .transition()
        .ease(d3.easeExp)
        .duration(2000)
          .style('x', d => x(d.constructor) + 'px')
          .style('y', d => (y(d[analisis])) + 'px')
          .style('height', d => (alto - y(d[analisis])) + 'px')
          .style('fill', d => color(d.constructor))
          .style('width', d => `${x.bandwidth()}px`)

  bars.exit()
      .transition()
      .duration(2000)
        .style('height', '0px')
        .style('y', d => `${y(0)}px`)
        .style('fill', '#000000')
      .remove()


  yAxisCall = d3.axisLeft(y)
                .ticks(10)
                .tickFormat(d => d + ((analisis == 'efectividad') ? '%' : ''))
  yAxisGroup.transition()
            .duration(2000)
            .call(yAxisCall)

  xAxisCall = d3.axisBottom(x)
  xAxisGroup.transition()
            .duration(2000)
            .call(xAxisCall)
            .selectAll('text')
            .attr('x', '-8px')
            .attr('y', '-5px')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
}

// IV. Carga de datos
d3.csv('dataset_f1.csv')
.then(function(data) {
  data.forEach(d => {
    d.carreras = +d.carreras
    d.ganadas = +d.ganadas
    d.efectividad = +d.efectividad
  })

  dataArray = data

  //Damos color a los 'constructores'
  color.domain(data.map(d => d.constructor))

  // V. Despliegue
  frame()
})
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

function frame() {
  dataframe = dataArray

  dataframe.sort((a, b) => {
    return ascendente ? d3.ascending(a[analisis], b[analisis]) : d3.descending(a[analisis], b[analisis])
  })


  maxy = d3.max(dataframe, d => d[analisis])
  y.domain([0, maxy])
  x.domain(dataframe.map(d => d.constructor))

  render(dataframe)
}

analisisSelect.on('change', () => {
  analisis = analisisSelect.node().value
  frame()
})

function cambiaOrden() {
  ascendente = !ascendente
  frame()
}