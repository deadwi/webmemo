<template>
  <v-layout row id="scroll-target" v-scroll:#scroll-target="onScroll">
    <v-flex xs12 sm6 offset-sm3>
      <v-list v-for="(day, date, dayIndex) in memo" :key="date" two-line subheader>
        <v-divider v-if="dayIndex != 0" inset></v-divider>
        <v-subheader inset>{{ date }}</v-subheader>
        <v-list-tile v-for="(row, rowKey) in day" :key="rowKey" avatar @click="selectedRowKey = row.index">
          <v-list-tile-avatar>
            <v-icon class="grey lighten-1 white--text">{{ getMemoIcon(row) }}</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>{{ getMemoTime(row) }}</v-list-tile-sub-title>
            <v-list-tile-title>{{ getMemoTitle(row) }}</v-list-tile-title>
            <v-list-tile-sub-title v-if="row.note">{{ row.note }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action v-if="selectedRowKey == row.index">
            <v-btn icon ripple @click="popupEditDialog(row)">
              <v-icon color="grey lighten-1">edit</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-card>
        <v-card-text></v-card-text>
        <v-card-text></v-card-text>
      </v-card>
    </v-flex>

    <v-btn @click.stop="popupInputDialog()" fixed dark fab bottom right color="pink">
      <v-icon>add</v-icon>
    </v-btn>

    <v-dialog v-model="inputDialog" max-width="400px">
      <v-card>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs6>
                <v-menu ref="dateMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="input.date"
                  lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                  <v-text-field slot="activator" v-model="input.date" label="Date" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="input.date" @input="$refs.dateMenu.save(input.date)" no-title></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs6>
                <v-menu ref="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="input.time"
                  lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                  <v-text-field slot="activator" v-model="input.time" label="Time" prepend-icon="access_time" readonly></v-text-field>
                  <v-time-picker v-model="input.time" @change="$refs.timeMenu.save(input.time)"></v-time-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12>
                <v-text-field @click.stop="categoryDialog = true" v-model="input.category" label="Category" readonly required></v-text-field>
              </v-flex>
              <v-flex xs12 v-if="enableAmount()">
                <v-text-field v-model="input.amount" label="Amount" mask="##########" type="tel"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="input.note" label="Note" hint="write a note" textarea></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions v-if="input.index === null">
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="inputDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="putMemo(input)">Save</v-btn>
        </v-card-actions>
        <v-card-actions v-else>
          <v-btn color="error" depressed @click.native="deleteMemo(input)">Delete</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="inputDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="updateMemo(input)">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="categoryDialog" max-width="400px">
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

    <v-dialog v-model="confirmDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Delete the memo?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="confirmDialog = false">Cancel</v-btn>
          <v-btn color="info" depressed @click.native="deleteMemo(input)">Ok</v-btn>
        </v-card-actions>
      </v-card>
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
  import {insertLine, updateLine, deleteLine, getData} from '@/api/api'
  import moment from 'moment'

  export default {
    props: ['isSignedIn'],
    data: () => ({
      offsetTop: 0,
      inputDialog: false,
      categoryDialog: false,
      confirmDialog: false,
      input: {
        index: null,
        date: null,
        time: null,
        category: null,
        amount: null,
        note: null
      },
      selectedRowKey: null,
      category: {},
      memo: {}
    }),
    created: function () {
      const self = this
      const gdata = this.$gAuth.getData()
      this.category = gdata.category

      getData(this).then(memo => {
        self.memo = memo
      })
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
      popupInputDialog () {
        const now = moment()
        this.input.index = null
        this.input.date = now.format('YYYY-MM-DD')
        this.input.time = now.format('HH:mm:ss')
        this.input.amount = null
        this.input.note = null
        this.inputDialog = true
      },
      popupEditDialog (row) {
        const now = moment(row.date)
        this.input.index = row.index
        this.input.date = now.format('YYYY-MM-DD')
        this.input.time = now.format('HH:mm:ss')
        this.input.category = row.category
        this.input.amount = row.amount
        this.input.note = row.note
        this.inputDialog = true
      },
      enableAmount () {
        if (this.input.category && this.category[this.input.category]) {
          return this.category[this.input.category].amount === true
        }
        return false
      },
      putMemo (data) {
        const self = this

        if (!this.enableAmount()) {
          data.amount = null
        }

        insertLine(this, data.date + ' ' + data.time, data.category, data.amount, data.note).then(memo => {
          self.memo = memo
        })
        this.inputDialog = false
      },
      updateMemo (data) {
        const self = this

        if (!this.enableAmount()) {
          data.amount = null
        }

        updateLine(this, data.index, data.date + ' ' + data.time, data.category, data.amount, data.note).then(memo => {
          self.memo = memo
        })
        this.inputDialog = false
      },
      deleteMemo (data) {
        const self = this
        if (this.confirmDialog) {
          deleteLine(this, data.date, data.index).then(memo => {
            self.memo = memo
          })
          this.confirmDialog = false
          this.inputDialog = false
        } else {
          this.confirmDialog = true
        }
      },
      getMemoTime (row) {
        return moment(row.date).format('LT')
      },
      getMemoIcon (row) {
        const c = row.category
        if (c in this.category) {
          return this.category[c].icon
        }
        return 'help'
      },
      getMemoTitle (row) {
        const c = row.category
        if (c in this.category) {
          return (this.category[c].parent ? this.category[c].parent + ' - ' : '') + this.category[c].title + (this.category[c].amount ? ' ( ' + row.amount + ' ) ' : '')
        }
        return c
      }
    },
    updated: function () {
      if (this.selectedRowKey === null) {
        window.scrollTo(0, document.body.scrollHeight)
      }
    }
  }
</script>
