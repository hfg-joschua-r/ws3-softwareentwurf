<template>
<div class="container">
  <div v-for="(device) in devices" :key="device.deviceID">
    Device-ID: {{device.deviceID}}.  
    <div class="row justify-content-md-center">
      <div class="col">
      WertxY
        <div v-for="(value, index) in devices[0].values" :key="value.values">
          {{ index }} {{ value.createdAt }} {{ value.moisture }}
        </div>
      </div>
      <div class="col">
     BildUZY
        <div v-for="(image, index) in devices[0].images" :key="image.imgUrl">
          {{ index }} {{ image.imgUrl }}
        </div>
      </div>
    </div>
  </div>
  <button type="button" class="btn btn-primary float-right" >Add new Device</button>
</div>

</template>
<script>
import axios from "axios"
import authHeader from '../services/auth-header';
export default {
  name: "Home",
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }
    //get all devices related to the user
    axios.get(this.hostname + "/api/pairedDevices/" + this.currentUser.username, {headers: authHeader()})
      .then((res) => {
        console.log(res.data[0].deviceID)
        this.devices = res.data;
        //bei mehreren devices hier for schleife
        this.getLastValues(res.data[0].deviceID)
        this.getLastImages(res.data[0].deviceID)
      })
      .catch((err) => {
        console.log(err);
      })
  },
  data() {
    return {
      devices: [],
      hostname: 'http://127.0.0.1:3002',
    };
  },
  methods: {
    getLastValues(deviceID){
      axios.get(this.hostname + "/api/lastValues/" + deviceID, {headers: authHeader()})
      .then((res) => {
        console.log(res)
        this.devices[0].values = res.data;
        //console.log(this.devices[0].values)
      })
      .catch((err) => {
        console.log(err);
      })
    },
    getLastImages(deviceID){
      axios.get(this.hostname + "/api/lastImages/" + deviceID, {headers: authHeader()})
      .then((res) => {
        console.log(res)
        this.devices[0].images = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    },
  }
};
</script>
<style scoped>
.device-container {
  border: black, 20px;
}
</style>