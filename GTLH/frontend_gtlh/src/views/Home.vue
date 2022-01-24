<template>
  <main role="main" class="container-xxl" id="wrapper">
    <div v-for="device in devices" :key="device.deviceID">
      Device-ID: {{ device.deviceID }}.
      <div class="row justify-content-md-left">
        <div id="chart" class="col">
          <apexchart
            type="area"
            height="500"
            width="865"
            :options="chartOptions"
            :series="series"
            @dataPointMouseEnter="test"
          ></apexchart>
        </div>

        <div class="col-md 8">
          <img :src="curImg" class="rounded-lg" />
          <h5 class="card-header">Current timelapse {{ curDate }}</h5>
          <p class="card-text"> </p>
        </div>
        <div>
          <carousel :items-to-show="3" :wrap-around="false">
            <slide
              v-for="image in devices[0].images"
              :key="image.imgUrl"
              class="carousel__item"
            >
              <div class="card bg-white text-white">
                <img
                  v-bind:src="image.imgUrl"
                  class="rounded-lg image-fluid card-img-top"
                />
                <div class="card-img-overlay">
                  <h5 class="card-title">{{ dateTime(image.createdAt) }}</h5>
                </div>
              </div>
            </slide>
            <template #addons>
              <navigation />
              <pagination />
            </template>
          </carousel>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="btn btn-secondary float-left"
      data-toggle="modal"
      data-target="#exampleModal"
    >
      Add new Device
    </button>
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Adding new device
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="recipient-name" class="col-form-label"
                  >Device-ID:</label
                >
                <input type="text" class="form-control" v-model="deviceID" />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              @click="pairNewDevice"
            >
              Add device
            </button>
          </div>
          <div class="alert alert-success" role="alert" v-if="pairingSucessful">
            Sucessfully paired device!
          </div>
          <div class="alert alert-warning" role="alert" v-if="pairingFailed">
            Sucessfully paired device!
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
/* eslint-disable */
import axios from "axios";
import authHeader from "../services/auth-header";
import VueApexCharts from "vue3-apexcharts";
import moment from "moment";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";

export default {
  name: "Home",
  components: {
    apexchart: VueApexCharts,
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //get all devices related to the user
    axios
      .get(
        this.userservice + "/api/pairedDevices/" + this.currentUser.username,
        {
          headers: authHeader(),
        }
      )
      .then((res) => {
        console.log(res.data[0].deviceID);
        this.devices = res.data;
        //bei mehreren devices hier for schleife
        this.getLastImages(res.data[0].deviceID);
        this.getLastValues(res.data[0].deviceID);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  data() {
    return {
      devices: [],
      userservice: "http://127.0.0.1:3002",
      pairingSucessful: false,
      pairingFailed: false,
      deviceID: "",
      curImg: null,
      curDate: "",
      ///
      series: [
        {
          name: "Moisture",
          //example val
          data: [],
        },
      ],
      chartOptions: {
        chart: {
          type: "area",
          zoom: {
            enabled: false,
          },
          events: {
            dataPointMouseEnter: (event, chart, opts) => {
              console.log("test");
            },
            dataPointMouseLeave: (event, chart, opts) => {
              console.log("test");
            },
            dataPointSelection(event, chartContext, config) {
              console.log(config.config.series[config.seriesIndex]);
              console.log(config.config.series[config.seriesIndex].name);
              console.log(
                config.config.series[config.seriesIndex].data[
                  config.dataPointIndex
                ]
              );
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
        },
        title: {
          text: "Soil moisture",
          align: "left",
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: [],
        },
       /* tooltip: {
          shared: false,
          intersect: true,
        },
        markers: {
          size: 3,
        },*/
      },
    };
  },
  methods: {
    getLastValues(deviceID) {
      axios
        .get(this.userservice + "/api/lastValues/" + deviceID, {
          headers: authHeader(),
        })
        .then((res) => {
          console.log(res);
          this.devices[0].values = res.data;
          //update line Chart
          this.updateLineChart(this.devices[0].values);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getLastImages(deviceID) {
      axios
        .get(this.userservice + "/api/lastImages/" + deviceID, {
          headers: authHeader(),
        })
        .then((res) => {
          console.log(res);
          this.devices[0].images = res.data;
          this.nextImg(res.data.length - 1);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    updateLineChart(data) {
      let newData = [];
      let newCategories = [];
      //console.log(data);
      for (let i = 0; i < data.length; i++) {
        newData.push(parseInt(data[i].moisture));
        let date = moment(data[i].createdAt).format("D. MMM, HH:mm:ss ");
        newCategories.push(date);
      }
      this.series = [
        {
          data: newData.reverse(),
        },
      ];
      this.chartOptions = {
        xaxis: {
          categories: newCategories.reverse(),
          labels: {
            show: false,
          },
        },
      };
    },
    dateTime(value) {
      return moment(value).format("D. MMM, HH:mm:ss ");
    },
    pairNewDevice() {
      if (this.deviceID != "") {
        axios
          .post(
            this.userservice + "/api/pairDevice",
            {
              deviceID: this.deviceID,
              username: this.currentUser.username,
            },
            {
              headers: authHeader(),
            }
          )
          .then((res) => {
            console.log(res);
            if (res.status == 200) {
              this.pairingSucessful = true;
              setTimeout(() => {
                this.pairingSucessful = false;
              }, 4000);
            } else {
              //show warning
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    //image function
    nextImg(index) {
      //console.log(this.devices[0].images[index].imgUrl)
      if (index < 0) {
        index = this.devices[0].images.length - 1;
      }
      this.curImg = this.devices[0].images[index].imgUrl;
      this.curDate = this.dateTime(this.devices[0].images[index].createdAt);
      setTimeout(() => {
        this.nextImg(index - 1);
      }, 200);
    },
    test() {
      console.log("test function");
    },
  },
};
</script>
<style scoped>
#wrapper {
}
.device-container {
  border: black, 20px;
}
.carousel__slide > .carousel__item {
  transform: scale(1);
  opacity: 0.5;
  transition: 0.5s;
}
.carousel__slide--visible > .carousel__item {
  opacity: 1;
  transform: rotateY(0);
}
.carousel__slide--next > .carousel__item {
  transform: scale(0.7) translate(-10px);
}
.carousel__slide--prev > .carousel__item {
  transform: scale(0.7) translate(10px);
}
.carousel__slide--active > .carousel__item {
  transform: scale(1.1);
}
</style>