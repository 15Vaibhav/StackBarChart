module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private svg: d3.Selection<SVGElement>;
        private xAxisGroup: d3.Selection<SVGElement>;
        private yAxisGroup: d3.Selection<SVGElement>;
        private BarGroup: d3.Selection<SVGElement>;
        private visualSettings: VisualSettings;

        private setting = {
            axis: {
                x: { padding: 30 },
                y: { padding: 60 }
            }
        };


        constructor(options: VisualConstructorOptions) {
            this.svg = d3.select(options.element)
            this.svg = d3.select(options.element)
                .append('svg')
                .classed('svgClass', true);
            this.xAxisGroup = this.svg.append('g')
                .classed('x-axis', true)
            this.yAxisGroup = this.svg.append('g')
                .classed('y-axis', true)
            this.BarGroup = this.svg.append('g')
                .classed('cost', true)

        }
        public update(options: VisualUpdateOptions) {
            let width: number = options.viewport.width;
            let height: number = options.viewport.height;
            let viewModel: any
            viewModel = this.getViewModel(options);
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            console.log('this is the view model', viewModel)
            this.svg.attr({ width: width, height: height});
            this.svg.selectAll('.rect').remove()
            this.svg.selectAll('.bartext').remove()
            this.svg.selectAll('.recttext').remove()
            this.svg.selectAll('.cost').remove()
            this.svg.selectAll('.legend').remove()

            function wrap(text, width) {
                console.log('width', width)
                text.each(function () {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (this.getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }





            let keys = Object.keys(viewModel[0])
            console.log(viewModel)
            console.log('keys....', keys)
            keys.shift()
            console.log(keys.length)
            let valuekeys = keys.slice(0, keys.length / 2)
            console.log('value keys',valuekeys)

            let c = -1
            var dataset = d3.layout.stack()(valuekeys.map(function (fruit) {
                // console.log('fruits..',fruit)
                c++;
                return viewModel.map(function (d) {
                    console.log('d...', d)
                    return { x: (d.category), y: +d[fruit], growth: d['growth' + c], total: d['total'] };
                });

            }));

            console.log('dataset', dataset)

            var x = d3.scale.ordinal()
                .domain(dataset[0].map(function (d) { return (d.x).toString(); }))
                .rangeRoundBands([10, width], 0.6);

            var y = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d.y0 + d.y; }); })])
                .range([height - this.setting.axis.y.padding, 60]);

            // var colors = ["#808080", "#696969", "#DC143C", "#FF0000", '#B22222'];
            var colors=["#363636","#636363","#898989","#fd2030","#b50d19","#840710"]



            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5)
                .tickSize(2)

                .tickFormat(function (d) { return null });

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(2)
                

            this.yAxisGroup
                .attr("class", "y axis")
                .call(yAxis)
                .attr({ transform: 'translate(' + (10) + ',0)' })

            this.xAxisGroup
                .attr("class", "x axis")
                .call(xAxis)
                .attr({ transform: 'translate(' + 0 + ',' + (height - this.setting.axis.y.padding) + ')' })
                .style('font-weight', 'bolder')
                .style("font-size", this.settings.Arc.axis_text_size+"px")
                .style("font-family", 'sans-serif')
                
                




            var groups = this.svg.selectAll("g.bar")
                .data(dataset)
                .enter().append("g")
                .attr("class", "cost")
                .style("fill", function (d, i) { return colors[i]; });

            var rect = groups.selectAll("rect")
                .data(function (d) { return d; })
                .enter()
                .append("rect")
                .attr("x", function (d) { return x(d['x']); })
                .attr("y", function (d) { return y(d['y0'] + d['y']); })
                .attr("height", function (d) { return y(d['y0']) - y(d['y0'] + d['y']); })
                .attr("width", x.rangeBand())



            groups.selectAll(".bartext")
                .data(function (d) { return d; })
                .enter()
                .append("text")
                .attr("class", "bartext")
                .attr("fill", "white")
                .attr("x", function (d) { return x(d['x']) + x.rangeBand() / 2; })
                .attr("y", function (d) { return y(d['y0'] + d['y'] / 2); })
                .text(function (d) {
                    let diff;
                    let percentValue;
                    // console.log('diff', y(d['y0']) - y(d['y0'] + d['y']));
                    diff = y(d['y0']) - y(d['y0'] + d['y']);
                    if (diff > 15) {
                       
                        return Math.round(d['y']) + "%";
                    } else {
                        return null
                    }
                })
                .style('font-size', x.rangeBand()*(this.settings.Arc.bar_text_size/1000)+'em')
                .style('fill', 'white')
                .style('text-anchor', 'middle')
                .style('font-weight','bolder')

                .attr('dy','.5em')




            let bars_5 = groups
                .selectAll(".bar")
                .data(function (d) { return d; })
                .enter()
                .append("rect")
                .classed('.rect',true)
                .attr("x", function (d) { return x(d['x']) +1.2* x.rangeBand(); })
                .attr("y", function (d) {
                    let findMaximum=0, diff,diff_1;
                    console.log('diff', y(d['y0'] + .5 * d['y']) +11);
                    console.log('height...',height-30)
                    diff_1 =  y(d['y0'] + .5 * d['y']) +11
                    diff = y(d['y0']) - y(d['y0'] + d['y']);
                    if(d['y']>10 && diff_1>(height-30)){
                       return y(d['y0'] + d['y'])
                    }
                    return y(d['y0'] + .5 * d['y']) -7; })
                   .attr("height", function (d) {
                    let findMaximum=0, diff,diff_1;
                    console.log('diff', y(d['y0'] + .5 * d['y']) +11);
                    console.log('height...',height-30)
                    diff_1 =  y(d['y0'] + .5 * d['y']) +11
                    diff = y(d['y0']) - y(d['y0'] + d['y']);
                    if(d['y']>10 && diff_1>(height-30)){
                    return y(d['y0']) - y(d['y0'] + d['y'])
                    }
                    return 18
                })
                .attr("width", x.rangeBand()-.2*x.rangeBand() )
                .style('fill', '#DCDCDC')



                .style("opacity", function (d) {
                    let findMaximum=0, diff,diff_1;
                    console.log('diff', y(d['y0'] + .5 * d['y']) +11);
                    console.log('height...',height-30)
                    diff_1 =  y(d['y0'] + .5 * d['y']) +11
                    diff = y(d['y0']) - y(d['y0'] + d['y']);
                    if(d['y']>10){
                        findMaximum =1;
                    }
                    // findMaximum = (diff > 15 & ) ? 1 : 0;
                    return findMaximum
                })


            groups.selectAll(".recttext")
                .data(function (d) { return d; })
                .enter()
                .append("text")
                .attr("class", "recttext")
                .style('fill', function (d) {
                    if (parseInt(d['growth']) >= 0) {
                        return 'green'
                    }
                    else {
                        return 'red'
                    }
                })
                .attr("x", function (d) { return x(d['x']) + 1.32 * x.rangeBand(); })
                .attr("y", function (d) { return y(d['y0'] + d['y'] / 2); })
                .style('font-weight','bolder')
                .text(function (d) {
                    let diff,diff_1;
                    diff_1 =  y(d['y0'] + .5 * d['y']) +11

                    diff = y(d['y0']) - y(d['y0'] + d['y']);
                    if(d['y']>10){
                        return (d['growth']).toFixed(1)+'%';
                    } else {
                        return null
                    }
                })
                .style('font-size', x.rangeBand()*(this.settings.Arc.rect_text_size/1000)+'em')
                .attr('dy', '.5em')





            var legend = this.svg.selectAll(".legend")
                .data(colors)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) { return 'translate(' +(i*2) +'30)'; });
                // .attr({ transform: 'translate(' + (this.setting.axis.y.padding) + ',0)' })


            legend
            .append("rect")
                .attr("x",20)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", function (d, i) {
                    if (i <= valuekeys.length - 1)
                        return colors.slice()[i]
                    else {
                        return 'white'
                    }

                    ;
                });

            legend.append("text")
                .attr("x",45)
                .attr("y", 9)
                .attr("dy", ".25em")
                .style("text-anchor", "start")
                //   .style('font-size',this.settings.Arc.legend_text_size/100+'em')
                .text(function (d, i) {
                  
                    if (i <= valuekeys.length - 1)
                    return valuekeys[i]
                    // return "Stephens Stephens"

                });

        }
        private static parseSettings(dataView: DataView): VisualSettings {
            console.log('dvvv', VisualSettings.parse(dataView) as VisualSettings)
            return VisualSettings.parse(dataView) as VisualSettings;
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.visualSettings ||
                VisualSettings.getDefault() as VisualSettings;
            return VisualSettings.enumerateObjectInstances(settings, options);
        }


        private getViewModel(options: VisualUpdateOptions) {

            let dv = options.dataViews;
            let view = dv[0].categorical;
            let categories = view.categories[0];
            let value = [{}]
            let growth = [{}]
            let catVals = {}, obj = {}, growthVals = {};
            let b = [], x = [], g = [];
            let calTotal = 0;

            console.log('view vsalue', view.values)

            //************************************ *get Array of values and growth Array**************************************
            for (let i = 0; i < view.values.length; i++) {
                if (i % 2 == 0) {
                    value.push(view.values[i])
                } else {
                    growth.push(view.values[i])
                }
            }
            value.shift()
            growth.shift()
            console.log('value array', value)
            console.log('growth array', growth)
            // ***********************************get  value  and growth *******************************************
            let total_per =[];
            for (let i = 0; i < categories.values.length; i++) {
               let cp =0
                for (let j = 0; j <= value.length - 1; j++) {
                    x = [];
                    g = []
                    x = value[j]['values']
                    catVals[value[j]['source']['groupName']] = x[i]
                    cp= cp + x[i]

                    g = growth[j]['values']
                    growthVals['growth' + j] = g[i]
                }
                total_per [i] =cp
                console.log('total',total_per)
            }

            for (let i = 0; i < categories.values.length; i++) {
                catVals = {};
                obj = {};
                growthVals = {}
                calTotal = 0
                for (let j = 0; j <= value.length - 1; j++) {
                    x = [];
                    g = []
                    x = value[j]['values']
                    catVals[value[j]['source']['groupName']] = (x[i]*100)/total_per[i]
                    calTotal = calTotal + x[i]

                    g = growth[j]['values']
                    growthVals['growth' + j] = g[i]
                }
                obj['category'] = categories.values[i],

                    (<any>Object).assign(obj, catVals);
                (<any>Object).assign(obj, growthVals);
                obj['total'] = calTotal,
                   
                  
                 console.log('object', obj);
                    b.push(obj);
                console.log('b.....', b)
            }
           
            return b

        }


    }

}