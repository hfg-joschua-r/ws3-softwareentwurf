<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
  <div class="container-fluid">
    <router-link to="/" class="navbar-brand" href="#">GrowTimeLapseHelper</router-link>
    
    <div v-if="!currentUser">
      <ul class="navbar-nav me-auto mb-2 mb-md-0">
        <li class="nav-item">
          <router-link to="/login" class="nav-link active" href="#">Login</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/register" class="nav-link active" href="#">Register</router-link>
        </li>
      </ul>
    </div>
    <div v-if="currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <router-link to="/profile" class="nav-link">
            <font-awesome-icon icon="user" />
            {{ currentUser.username }}
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="logOut">
            <font-awesome-icon icon="sign-out-alt" /> LogOut
          </a>
        </li>
      </div>
  </div>
</nav>
</template>
<script>
export default {
    computed: {
      currentUser() {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    logOut() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    }
  }
}
</script>
<style scoped>
</style>