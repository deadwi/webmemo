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
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        drawer: false
      }
    },
    methods: {
      signIn () {
        this.$gAuth.signIn(function (user) {
          console.log('user', user)
        }, function (error) {
          console.log(error)
        })
      }
    }
  }
</script>
