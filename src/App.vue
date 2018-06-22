<template>
  <v-app>
    <v-toolbar dark color="primary" fixed>
      <v-btn icon @click.stop="signIn()">
        <v-icon>view_list</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>dashboard</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>bar_chart</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content style="margin-top: 56px;">
      <router-view v-if="isSignedIn" v-bind:isSignedIn="isSignedIn" />
      <v-card v-if="!isSignedIn" height="100%">
        <h3 v-if="!isAuth" class="display-3 text-xs-center">...</h3>
        <v-btn v-if="isAuth" icon @click.stop="signIn()">
          <v-icon>face</v-icon>
        </v-btn>
      </v-card>
    </v-content>
  </v-app>
</template>

<script>
  import EventBus from '@/api/event_bus'

  export default {
    name: 'App',
    data () {
      return {
        isAuth: false,
        isSignedIn: false
      }
    },
    created: function () {
      EventBus.$on('loadedAuth', this.activeAuth)
      EventBus.$on('signedIn', this.activeUser)
    },
    methods: {
      signIn () {
        const self = this
        this.$gAuth.signIn(function (user) {
          self.isSignedIn = true
        }, function (error) {
          console.log(error)
        })
      },
      activeUser () {
        this.isSignedIn = true
      },
      activeAuth () {
        this.isAuth = true
      }
    }
  }
</script>
