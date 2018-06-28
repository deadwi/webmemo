<template>
  <v-container grid-list-md>
    <v-layout wrap>
      <v-flex xs12>
        <vue-highcharts :options="options" ref="lineCharts"></vue-highcharts>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>

<script>
  import VueHighcharts from 'vue2-highcharts'
  import {getData} from '@/api/api'
  import moment from 'moment'

  export default{
    components: {
      VueHighcharts
    },
    data: () => ({
      options: {
        chart: {
          type: 'line'
        },
        title: {
          text: 'Daily Amount'
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {
            text: null
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          line: {
            marker: {
              enabled: false
            }
          },
          spline: {
            marker: {
              enabled: false
            }
          }
        },
        series: []
      }
    }),
    created: function () {
      const self = this
      const gdata = this.$gAuth.getData()
      const category = gdata.category

      getData(this).then(memo => {
        const days = []
        for (const date in memo) {
          const data = {}
          const day = memo[date]

          for (const ckey in category) {
            data[ckey] = 0
          }

          for (const i in day) {
            const row = day[i]
            const value = category[row.category].amount ? row.amount : 1
            data[row.category] += parseInt(value)
          }
          days.push({
            date: parseInt(moment(date).format('x')),
            data: data
          })
        }

        for (const ckey in category) {
          if (!category[ckey].amount) {
            continue
          }

          const data = []
          for (const i in days) {
            const day = days[i]
            if (day.data[ckey] !== undefined) {
              data.push({
                x: day.date,
                y: day.data[ckey]
              })
            }
          }

          self.$refs.lineCharts.addSeries({
            name: category[ckey].title,
            data: data
          })
        }
      })
    },
    methods: {
    }
  }
</script>
