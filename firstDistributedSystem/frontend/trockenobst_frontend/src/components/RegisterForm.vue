<template>
    <div class="register-form">
        <h3>Register</h3>
        <form @submit.prevent="register">
            <label for="username">Username: </label>
                <input type="text" id="username" name="username" v-model=username>
            <br>
            <label for="password">Password: </label>
                <input type="text" id="password" name="password" v-model=password>
            <br>
            <input type="submit" value="register"/>
        </form>
    </div>
</template>
<script>
import axios from "axios"
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
        let userData = {
            username:this.username,
            password:this.password
        };
        const uri = "http://localhost:3001/api/register";
        console.log(userData);
        axios
            .post(uri, userData)
            .then ((response) => {
                console.log("request sucessfully send");
                console.log(response)
            })
            .catch((error) => {
                console.log("error while posting");
                console.log(error)
            })
        
    },
  },
}
</script>
<style scoped>
.register-form {
    text-align: left;
    margin-left: 5%;
}
</style>