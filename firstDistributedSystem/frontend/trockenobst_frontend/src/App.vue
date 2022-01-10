<template>
<div>
  <RegisterForm/>
  <LoginForm/>
</div>
</template>

<script>
import RegisterForm from './components/RegisterForm.vue'
import LoginForm from './components/LoginForm.vue'

export default {
  name: 'App',
  components: {
    RegisterForm,
    LoginForm
  }
}
</script>

<style>
* {
  font-family: "Fira MS", sans-serif;
}
.register-form {
  display:block;
}
</style>
