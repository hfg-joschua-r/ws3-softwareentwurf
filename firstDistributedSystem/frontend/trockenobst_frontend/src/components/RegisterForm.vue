<template>
    <div class="register-form">
        <h3>Register</h3>
        <form @submit.prevent="register">
            <label for="username">Username: </label>
                <input type="text" id="username" name="username">
            <br>
            <label for="password">Password: </label>
                <input type="text" id="password" name="password">
            <br>
            <input type="submit" value="register" name="submit"/>
        </form>
    </div>
</template>
<script>
export default {
  name: 'RegisterForm',
  props: {},
  data() {
    return {
        username: "",
        password: ""
    }
  },
  methods: {
    register(){
        
    }
  }
}
</script>
<style scoped>
.register-form {
    text-align: left;
    margin-left: 5%;
}
</style>