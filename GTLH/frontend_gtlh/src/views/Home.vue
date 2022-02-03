<template>
  <main role="main" class="container-xxl" id="wrapper">
    <!-- Charts & timelapse section-->
    <div v-for="device in devices" :key="device.deviceID">
      <!-- Device-ID: {{ device.deviceID }} -->
      <div class="row justify-content-md-left">
        <div id="chart" class="col">
          <apexchart
            type="area"
            height="500"
            width="865"
            :options="chartOptions"
            :series="series"
            @click="chartClickHandler"
          ></apexchart>
        </div>
        <!--timelapse section-->
        <div class="col-md 8">
          <img
            :src="curImg"
            class="img"
            @click="showTimelapse = !showTimelapse"
          />
          <h5 class="card-header">Current timelapse {{ curDate }}</h5>
          <p class="card-text"></p>
        </div>
        <!-- Carousel section -->
        <div>
          <carousel :items-to-show="3" :wrap-around="false">
            <slide
              v-for="(image, index) in devices[0].images"
              :key="image.imgUrl"
              class="carousel__item"
            >
              <div class="card bg-white text-white" @click="carouselClickHandler(image.createdAt, index)" @mouseenter="image.showDetails= true" @mouseleave="image.showDetails = false">
                <img
                  v-bind:src="image.imgUrl"
                  class="rounded-lg image-fluid card-img-top carousel-img"
                />
                <div class="card-img-overlay">
                  <h5 class="card-title">{{ dateTime(image.createdAt) }}</h5>
                  <h5 v-if="image.showDetails" style="position: absolute; bottom: 5px; left: 15px">{{ image.moisture }}</h5>
                  <button
                    style="position: absolute; bottom: 5px; right: 5px"
                    class="btn btn-dark"
                    @click="deleteImage(image.imgUrl)"
                  >
                    Delete
                  </button>
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

    <!-- Adding new Device section! -->
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
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="recipient-name" class="col-form-label">Device-ID:</label>
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
    //benötigt wegen apexcharts bug: https://stackoverflow.com/questions/70825919/issue-with-apex-charts-rendering-twice-with-vue-3/70826352
    this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'));
    });
    //Alle dem User zugehörigen devices aus der Datenbank holen
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
        //bei mehreren devices wird hier for schleife benötigt
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
      showTimelapse: true,
      deviceID: "",
      curImg: null,
      curDate: "",
      activeClass: "img",
      pauseClass: "imgGray",

      //Hier kommen die Chart options!
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
            enabled: true,
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
        /*tooltip: {
          shared: false,
          intersect: true,
        },
        markers: {
          size: 3,
          showNullDataPoints: false
        },*/
      },
    };
  },
  methods: {
    //Letzte Moisture Werte aus der Datenbank/dem Backend holen
    getLastValues(deviceID) {
      axios
        .get(this.userservice + "/api/lastValues/" + deviceID, {
          headers: authHeader(),
        })
        .then((res) => {
          console.log(res);
          this.devices[0].values = res.data;
          //Unseren line chart updaten
          this.updateLineChart(this.devices[0].values);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //Letzte Bilder aus der Datenbank/dem Backend holen
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
    //Bild aus der Datenbank löschen
    deleteImage(imgUrl) {
      axios
        .post(
          this.userservice + "/api/deleteImage",
          { imgUrl: imgUrl },
          {
            headers: authHeader(),
          }
        )
        .then((res) => {
          console.log(res);
          this.devices[0].images = [];
          this.getLastImages(this.devices[0].deviceID);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //Line chart mit neuem Data set updaten
    updateLineChart(data) {
      let newData = [];
      let newCategories = [];
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
      //benötigt wegen apexcharts bug: https://stackoverflow.com/questions/70825919/issue-with-apex-charts-rendering-twice-with-vue-3/70826352
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'));
    });
    },
    //Hilfsfunktion um Zeit in einen angemessenen String umzuwandeln
    dateTime(value) {
      return moment(value).format("D. MMM, HH:mm:ss ");
    },
    //Request neue Device-ID zu pairen ans backend schicken
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
    //"Zeitraffer-Funktion", die Bilder werden aus dem array alle 200ms gewechselt
    //timelapse anhalten
    nextImg(index) {
      setTimeout(() => {
      if (index < 0) {
        index = this.devices[0].images.length - 1;
      }
      if (this.showTimelapse) {
        this.curImg = this.devices[0].images[index].imgUrl;
        this.curDate = this.dateTime(this.devices[0].images[index].createdAt);
      }
      let _this = this
      
        _this.nextImg(index - 1);
      }, 200);
    },
    chartClickHandler(event, chartContext, config) {
      if(config.seriesIndex > -1){
      let valArr = this.devices[config.seriesIndex].values;
      let date = valArr[config.dataPointIndex + valArr.length - config.dataPointIndex * 2 - 1].createdAt;

      //api request to find nearest date
      axios.post(this.userservice + "/api/nearestImg/", {
        date: date,
        deviceID: this.devices[0].deviceID
      }, { headers: authHeader() })
      .then((res) => {
        console.log(res.data[0].createdAt)
        console.log(res.data[0].imgUrl)
        this.curImg = res.data[0].imgUrl
        this.curDate = this.dateTime(res.data[0].createdAt)
        if(this.showTimelapse) {
          this.showTimelapse = false;
        }
      })
      .catch((err) => {
        console.log(err)
      })
      }
    },
    test(){
      console.log("test")
    },
    carouselClickHandler(date, index){
    //api request to find nearest moisture Val
    axios.post(this.userservice + "/api/nearestVal", {
        date: date,
        deviceID: this.devices[0].deviceID
      }, { headers: authHeader() })
      .then((res) => {
        console.log(res.data[0].moisture);
        this.devices[0].images[index].moisture = "Moisture: " + res.data[0].moisture + "%"
      })
      .catch((err) => {
        console.log(err)
        return "error"
      })
    }
  },
};
</script>
<style scoped>
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
.img {
  border-radius: 2%;
  -webkit-filter: grayscale(0);
  filter: none;
}
.imgGray {
  border-radius: 0%;
  filter: gray; /* IE6-9 */
  -webkit-filter: grayscale(1); /* Google Chrome, Safari 6+ & Opera 15+ */
  filter: grayscale(1); /* Microsoft Edge and Firefox 35+ */
}
</style>