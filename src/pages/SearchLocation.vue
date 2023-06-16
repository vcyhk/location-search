<template>
    <div>
        <div class="ui inverted segment">
            <div class="ui inverted secondary pointing menu">
                <a class="active item" href="./">
                    Location Search
                </a>
            </div>
        </div>
        <div class="ui stackable two column vertically divided grid container">
            <div class="column">
                <h1>Map</h1>
                <form class="ui segment large form">
                    <div class="ui message red" v-show="error">{{error}}</div>
                    <div class="ui segment">
                        <div class="field">
                            <div class="ui right icon input large" :class="{loading:spinner}">
                                <input 
                                type="text" 
                                placeholder="Enter your address" 
                                v-model="address"
                                id="autocomplete"/>
                                <i class="location arrow link icon" @click="locateUserButton"></i>
                            </div>
                        </div>
                    </div>
                </form>
                <div id="map" ref="map"></div>
            </div>
                
            <div class="column">
                <div>
                    <h1>Search Record</h1>
                    <div class="ui list" v-show="places.length === 0">
                        <p class="ui message">No records</p>
                    </div>
                    <div v-show="places.length > 0">
                        <div class="pt-2">
                            <b-button variant="warning" @click="del">Delete Selected</b-button>
                            <b-button variant="danger" @click="deleteSelectAll">Delete All</b-button>
                            <v-table class="table"
                                :data="places"
                                :currentPage.sync="currentPage"
                                :pageSize="10"
                                @totalPagesChanged="totalPages = $event">
                                <thead slot="head" class="align-middle">
                                    <th>Action</th>
                                    <th>Address</th>
                                    <th>Time zone</th>
                                    <th>Local time</th>
                                </thead>
                                <tbody slot="body" class="align-middle" slot-scope="{displayData}">
                                    <tr v-for="item in displayData" :key="item.id">
                                        <td>
                                            <input type="checkbox" @click="check(item)">
                                        </td>
                                        <td>{{ item.address }}</td>
                                        <td>{{ item.timeZone }}</td>
                                        <td>{{ item.localTime }}</td>
                                    </tr>
                                </tbody>
                            </v-table>

                            <div class="d-flex justify-content-center pt-3">
                                <smart-pagination
                                :currentPage.sync="currentPage"
                                :totalPages="totalPages"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios';

export default{
    name: 'Pagination',
    data() {
        return{
            currentPage: 1,
            totalPages: 0,
            sid: 0,
            fields: [
                { key: "selectRow", label: "" },
                { key: "address", label: "Address" },
                { key: "timeZone", label: "TimeZone" },
                { key: "localTime", label: "LocalTime" },
            ],
            selectedRows: [],
            address: "",
            timeZone: "",
            localTime: "",
            error: "",
            places: [],
            timestamp: "",
            spinner: false
        }
    },
    mounted(){
        var autocomplete = new google.maps.places.Autocomplete(
            document.getElementById("autocomplete")
        );

        autocomplete.addListener("place_changed", async () => {
            var place = autocomplete.getPlace();
            this.getTimeZone(place.geometry.location.lat(), place.geometry.location.lng());
            this.getAddress(place.geometry.location.lat(), place.geometry.location.lng());
            this.showLocationOnMap(
                place.geometry.location.lat(),
                place.geometry.location.lng()
            );

      });
    },
    methods: {
        locateUserButton(){
            this.spinner = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.getTimeZone(position.coords.latitude, position.coords.longitude);
                        this.getAddress(position.coords.latitude, position.coords.longitude);
                        this.showLocationOnMap(position.coords.latitude, position.coords.longitude);
                    },
                    error => {
                        this.error = "Unable to find your address. Please type your address.";
                        this.spinner = false;
                    }
                );
            } else {
                this.error = "Your browser does not support.";
                this.spinner = false;
            }
        },
        getAddress(lat, long) {
            axios.get(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=" 
                + lat + 
                "," 
                + long + 
                `&key=${process.env.GOOGLE_API}`
                )
            .then(response => {
                if(response.data.error_message) {
                    this.error = eesponse.data.error_message;
                } else {
                    this.address = response.data.results[0].formatted_address;
                    
                    this.places.push(
                        {
                            id: this.sid,
                            address: this.address,
                            timeZone: this.timeZone,
                            localTime: this.localTime,
                        }
                    );
                    ++this.sid;
                }
                this.spinner = false;
            })
            .catch(error => {
                this.error = error.message;
                this.spinner = false;
                console.log(error.message);
            })
        },
        getTimeZone(lat, long){
            var targetDate = new Date();
            var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60;
            axios.get(
                "https://maps.googleapis.com/maps/api/timezone/json?location=" 
                + lat + 
                "," 
                + long + 
                "&timestamp="
                + timestamp +
                `&key=${process.env.GOOGLE_API}`
                )
                .then(response => {
                if(response.data.error_message) {
                    this.error = eesponse.data.error_message;
                    console.log(response.data.error_message);
                } else {     
                    var offsets = response.data.dstOffset * 1000 + response.data.rawOffset * 1000;
                    var date = new Date(timestamp * 1000 + offsets);
                    this.timeZone = response.data.timeZoneName;
                    this.localTime = 
                        date.getHours() + ":" +
                        date.getMinutes()
                }
            })
            .catch(error => {
                this.error = error.message;
                console.log(error.message);
            })
        },
        showLocationOnMap(lat, long) {
            let map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: new google.maps.LatLng(lat, long),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            });

            new google.maps.Marker({
                position: new google.maps.LatLng(lat, long),
                map: map,
            });
        },
        deleteSelectAll(){
            this.selectedAll = false;
            this.places = [];
            this.selectedRows = [];
            this.sid = 0;
        },
        deleteSelected(){
            this.selectedRows.sort(function(a, b) {return a - b;});
            for (let i = 0; i <= this.selectedRows.length; i++) {
                this.$delete(this.places, this.selectedRows[i]);
            }
            this.selectedRows = [];
        },
        check(item) {
            if (!this.selectedRows.length || !this.selectedRows.find(f => item.id === f.id)) {
                this.selectedRows.push(item)
            } else {
                this.selectedRows = this.selectedRows.filter(f => item.id !== f.id)
            }
        },
        del() {
            this.places = this.places.filter(a => !this.selectedRows.includes(a))
            this.selectedRows = []
        }
    }
    
}
</script>

<style>
.location.arrow.icon{
    background-color: #25A7D1;
    color: white;
}
.pac-item {
padding: 10px;
font-size: 13px;
cursor: pointer;
}
.pac-item-query {
font-size: 15px;
}
#map {
    position: relative;
    height: 100%;
}
th,tr{
    padding:10px 20px;
    text-align: center;
}
</style>