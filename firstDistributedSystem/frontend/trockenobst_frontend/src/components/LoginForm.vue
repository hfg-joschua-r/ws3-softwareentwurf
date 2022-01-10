<template>
    <div class="login-form form">
        <h3>Login</h3>
        <form @submit.prevent="login">
            <label for="username">Username: </label>
                <input type="text" id="username" name="username" v-model=username>
            <br>
            <label for="password">Password: </label>
                <input type="text" id="password" name="password" v-model=password>
            <br>
            <input type="submit" value="login"/>
        </form>
    </div>
</template>
<script>
import axios from "axios"
export default {
  name: 'LoginForm',
  props: {},
  data() {
    return {
        username: "",
        password: ""
    }
  },
  methods: {
    login(){
        let userData = {
            username:this.username,
            password:this.password
        };
        const uri = "http://localhost:3001/api/login";
        console.log("logging in with username " + userData.username);
        axios
            .post(uri, userData)
            .then ((response) => {
                console.log("sucess while logging in");
                console.log(response)
            })
            .catch((error) => {
                console.log("error while logging in");
                console.log(error)
            })
    },
  },
}
</script>