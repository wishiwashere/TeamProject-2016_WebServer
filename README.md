#Wish I Was Here

Green screen keying web server, designed and built for use with the [Wish I Was Here](https://github.com/wishiwashere/TeamProject-2016) Android application, as part of the Team Project module of the Creative Multimedia B.Sc (Hons) degree course in Limerick Institute of Technology, Clonmel, Co. Tipperary.

This server is running live on [wishiwashere.azurewebsites.net](wishiwashere.azurewebsites.net), and offers an in-browser preview of the capabilities of the server on a sample image

###Personal Portfolios
_Eiren McLoughlin_: [eiren.projects.ie](www.eiren.projects.ie)  
_Laura Pigott_: [pigottlaura.com](www.pigottlaura.com)

###Server Functionalities
Images from the camera on a device running the app would be sent to the server through HTTP Post requests, so that the green screen keying could be carried out remotely, and the resulting keyed image returned to the device.

Due to the significant time that it was taking for the server to process the images (up to 30 seconds at times) it was decided that the green screen keying would remain within the core app, as images can be processed there within 2 to 3 seconds (although it does have a significant impact on the device's memory).

###Development
This application was developed through NodeJS in Visual Studio Code, through the following modules
* [ExpressJS](http://expressjs.com/)
	* To generate the basic structure of the server
* [Multer](https://www.npmjs.com/package/multer)
	* To parse the multipart form data
	* Store images uploaded through HTTP POST requests to the file system of the server (these images are only stored temporarily, and are deleted as soon as green screen keying has been completed)
* [Jimp](https://www.npmjs.com/package/jimp)
	* To access the pixel array of an image, and loop through it to check the hue, saturation and brightness of each pixel, to determine whether it is green
	* To create a new image, which contains only the green-free pixels of the original image
* [Onecolor](https://www.npmjs.com/package/onecolor)
	* To implicitly cast the integer colour of each pixel (as returned by the Jimp library) to the relevant colour space based on the methods used i.e. by calling .hue() on the colour, it is implicity cast to the HSV colour space.
	* Accessing the hue, saturation and value of each pixel, so that green screen keying could be completed

###Deployment
This running on an Azure server, through continous deployment from this GitHub repository - [wishiwashere.azurewebsites.net](wishiwashere.azurewebsites.net)

###Example
| Original Image        | Keyed Image           |
| ------------- | ------------- | 
| ![Wish I Was Here - Green Screen Keying Web Server - Original Image](https://github.com/wishiwashere/TeamProject-2016_WebServer/blob/master/public/images/girlGreenScreen.jpg "Wish I Was Here - Green Screen Keying Web Server - Original Image") | ![Wish I Was Here - Green Screen Keying Web Server - Keyed Image](https://github.com/wishiwashere/TeamProject-2016_WebServer/blob/master/KeyedImage.png "Wish I Was Here - Green Screen Keying Web Server - Keyed Image") |
