<template>
  <v-container fluid grid-list-md>
    <v-data-iterator
      :items="data"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      content-tag="v-layout"
      row
      wrap
    >
      <v-flex slot="item" slot-scope="props" xs6 sm6 md4 lg3>
        <v-card>
          <v-card-title><h4>{{ props.item.date }}</h4></v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-tile v-for="(c, ckey) in category" :key="ckey">
              <v-list-tile-content>{{getCategoryTitle(c)}}</v-list-tile-content>
              <v-list-tile-content class="align-end">{{ props.item.data[ckey] }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-data-iterator>
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
  import {getData} from '@/api/api'
  // import moment from 'moment'

  export default {
    data: () => ({
      rowsPerPageItems: [],
      pagination: {
        rowsPerPage: -1
      },
      category: {},
      data: [],
      items: [
        {
          value: false,
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: '14%',
          iron: '1%'
        }
      ]
    }),
    created: function () {
      const self = this
      const gdata = this.$gAuth.getData()
      this.category = gdata.category

      getData(this).then(memo => {
        const days = []
        for (const date in memo) {
          const data = {}
          const day = memo[date]

          for (const i in day) {
            const row = day[i]
            const value = this.category[row.category].amount ? row.amount : 1

            if (!data.hasOwnProperty(row.category)) {
              data[row.category] = 0
            }
            data[row.category] += parseInt(value)
          }
          days.push({
            date: date,
            data: data
          })
        }

        self.data = days
      })
    },
    methods: {
      getCategoryTitle (c) {
        return (c.parent ? c.parent + ' - ' : '') + c.title
      }
    },
    updated: function () {
      window.scrollTo(0, document.body.scrollHeight)
    }
  }
</script>
