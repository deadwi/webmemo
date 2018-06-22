<template>
  <v-layout row id="scroll-target" v-scroll:#scroll-target="onScroll">
    <v-flex xs12 sm6 offset-sm3>
      <v-list v-for="(day, date, dayIndex) in memo" :key="date" :selected="day.selected" two-line subheader>
        <v-divider v-if="dayIndex != 0" inset></v-divider>
        <v-subheader inset>{{ date }}</v-subheader>
        <v-list-tile v-for="(row, rowKey) in day" :key="rowKey" avatar @click="">
          <v-list-tile-avatar>
            <v-icon :class="[row.iconClass]">{{ row.icon }}</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>{{ row.subtitle }}</v-list-tile-sub-title>
            <v-list-tile-title>{{ row.title }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn v-if="day.selected" icon ripple>
              <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-flex>

    <v-btn @click.stop="dialog = true" fixed dark fab bottom right color="pink">
      <v-icon>add</v-icon>
    </v-btn>

    <v-dialog v-model="dialog">
      <v-card>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs6 sm6 md4>
                <v-menu ref="dateMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="input.date"
                  lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                  <v-text-field slot="activator" v-model="input.date" label="Date" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="input.date" @input="$refs.dateMenu.save(input.date)" no-title></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs6 sm6 md4>
                <v-menu ref="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="input.time"
                  lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                  <v-text-field slot="activator" v-model="input.time" label="Time" prepend-icon="access_time" readonly></v-text-field>
                  <v-time-picker v-model="input.time" @change="$refs.timeMenu.save(input.time)"></v-time-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field @click.stop="categoryDialog = true" v-model="input.category" label="Category" readonly></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4 v-if="enableAmount()">
                <v-text-field v-model="input.amount" label="Amount" mask="##########"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field v-model="input.note" label="Note" hint="write a note"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="putMemo()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="categoryDialog">
      <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
          <v-card>
            <v-list>
              <template v-for="item in categoryGroup">
                <v-list-group v-if="item.subs.length > 0" v-model="item.active" :key="item.title" :prepend-icon="item.action" no-action>
                  <v-list-tile slot="activator">
                    <v-list-tile-content>
                      <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile v-for="subItem in item.subs" :key="subItem.title" @click="input.category = subItem.id; categoryDialog = false;">
                    <v-list-tile-content>
                      <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list-group>
                <v-list-tile v-if="item.subs.length == 0" :key="item.title" :prepend-icon="item.action" @click="input.category = item.id; categoryDialog = false;">
                  <v-list-tile-action>
                    <v-icon>{{ item.action }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="categoryDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-dialog>
  </v-layout>
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
  import {insertLine} from '@/api/api'

  export default {
    data: () => ({
      offsetTop: 0,
      dialog: false,
      categoryDialog: false,
      input: {
        date: null,
        time: null,
        category: null,
        amount: null,
        note: null
      },
      category: {
        '소변': { icon: 'wc', title: '소변', amount: true },
        '음료': { icon: 'local_drink', title: '음료', amount: true },
        '미니린정': { icon: 'local_hospital', title: '미니린정', parent: '약' },
        '레피손정': { icon: 'local_hospital', title: '레피손정', parent: '약' },
        '씬지록신정': { icon: 'local_hospital', title: '씬지록신정', parent: '약' }
      },
      memo: {
        '2018-06-19': [
          { icon: 'folder', iconClass: 'grey lighten-1 white--text', title: 'Photos', subtitle: 'Jan 9, 2014' },
          { icon: 'folder', iconClass: 'grey lighten-1 white--text', title: 'Recipes', subtitle: 'Jan 17, 2014' },
          { icon: 'folder', iconClass: 'grey lighten-1 white--text', title: 'Work', subtitle: 'Jan 28, 2014' }
        ],
        '2018-06-20': [
          { icon: 'assignment', iconClass: 'blue white--text', title: 'Vacation itinerary', subtitle: 'Jan 20, 2014' },
          { icon: 'assignment', iconClass: 'blue white--text', title: 'Vacation itinerary', subtitle: 'Jan 20, 2014' },
          { icon: 'assignment', iconClass: 'blue white--text', title: 'Vacation itinerary', subtitle: 'Jan 20, 2014' },
          { icon: 'assignment', iconClass: 'blue white--text', title: 'Vacation itinerary', subtitle: 'Jan 20, 2014' },
          { icon: 'assignment', iconClass: 'blue white--text', title: 'Vacation itinerary', subtitle: 'Jan 20, 2014' },
          { icon: 'call_to_action', iconClass: 'amber white--text', title: 'Kitchen remodel', subtitle: 'Jan 10, 2014' }
        ]
      }
    }),
    created: function () {
    },
    computed: {
      categoryGroup: function () {
        const group = []
        const mapped = {}
        for (const id in this.category) {
          const x = this.category[id]
          const key = x.parent
          if (!key) {
            group.push({
              id: id,
              action: x.icon,
              title: x.title,
              subs: []
            })
          } else {
            if (!mapped.hasOwnProperty(key)) {
              mapped[key] = {
                action: x.icon,
                title: key,
                active: true,
                subs: []
              }
              group.push(mapped[key])
            }
            mapped[key].subs.push({
              id: id,
              title: x.title
            })
          }
        }
        return group
      }
    },
    methods: {
      onScroll (e) {
        this.offsetTop = e.target.scrollTop
      },
      enableAmount () {
        if (this.input.category && this.category[this.input.category]) {
          return this.category[this.input.category].amount === true
        }
        return false
      },
      putMemo () {
        insertLine(this, 'eventType', 'uid', 'id', 'memo').then(res => {
          console.log(res)
        })
        this.dialog = false
      }
    }
  }
</script>
