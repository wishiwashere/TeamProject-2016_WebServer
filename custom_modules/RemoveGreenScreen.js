// Jimp - the package used to read the image, loop through it's pixel array, read in the color of each
// pixel (as an integer), convert this integer to an RGBA (Red, Green, Blue, Alpha) object and visa versa,
// change the color of pixels, create a new cloned version of the original image and write images as a file
// to the storage on the server
var Jimp = require('jimp');

// OneColor - the package used to cast colors between different color spaces e.g. RGB (Red, Green, Blue) to
// HSV (Hue, Saturation, Value), and access the various color properties of these spaces using predefined
// methods e.g. .red()
var onecolor = require('onecolor');

var path = require("path");
var fs = require("fs");

// Creating the remove green screen functions object, which contains two funcitons - SD and HD
var RemoveGreenScreenFunctions = {
    SD: function (originalImage, cb) {
        // Lower Quality Result - Takes approximatley 5 seconds to process
    
        // Using the Jimp package to read in an image
        Jimp.read("./" + originalImage, function (err, cameraImage) {

            console.log("Image loaded");

            console.log("Removing green screen...");

            var keyingImageStarted = Date.now();
    
            // Creating a variable in which to store the keyed version of the image passed in. Defaulting this
            // to be equal to a clone of the original image, so that pixels which are not detected as green
            // will remain as they were originally without having to be set again
            var keyedImage = cameraImage.clone();

            // Using the Jimp package's scan() method to go through every pixel in the image that was passed in.
            // Basically this method is like having one loop to increment the x, and an inner loop to increment
            // the y, so that each pixel can be accessed individually, with reference to it's position in the
            // original image
            cameraImage.scan(0, 0, cameraImage.bitmap.width, cameraImage.bitmap.height, function (x, y, idx) {

                // Getting the colour of the current pixel (as an integer) and converting it to an RGBA
                // (Red, Green, Blue, Alpha) object
                var pixelColorObject = Jimp.intToRGBA(cameraImage.getPixelColor(x, y));
            
                // Using the properties of the pixelColorObject to create a new RGB (Red, Green, Blue)
                // string, so that the onecolor package will recognise it as a color
                var pixelColor = "rgb(" + pixelColorObject.r + ", " + pixelColorObject.g + ", " + pixelColorObject.b + ")";

                // Using the onecolor package to get the hue of the pixel colour (which returns a decimal value between
                // 0 and 1). Multiplying this value by 360 to map it to this more commonly used range for hues in the 
                // color specturm
                var pixelHue = onecolor(pixelColor).hue() * 360;
    
                // If the hue of this pixel falls anywhere within the range of green in the colour spectrum
                if (pixelHue > 60 && pixelHue < 180) {

                    // Only getting the saturation and brightness of the pixel now, as until we determine whether
                    // the current pixel was green or not, there was no point in taking up additional time/memory
                    var pixelSaturation = onecolor(pixelColor).saturation() * 100;
                    var pixelBrightness = onecolor(pixelColor).value() * 100;
                
                    // Creating a variable to hold the HSV (Hue, Saturation, Value) - also known as HSB (Hue, Saturation,
                    // Brightness) colour we want to set this pixel to. Defaulting this to be equal to the original colour
                    // of the pixel. Writing this variable as a string, in a format that onecolor will recognise as a color,
                    // so we can later cast it back to RGB (Red, Green, Blue) so the Jimp package can then cast it to an 
                    // integer before setting this as the colour for the current pixel (as Jimp pixels only accept integer values)
                    var hsvCol = "hsv(" + pixelHue + ", " + pixelSaturation + "%, " + pixelBrightness + "%)";
            
                    // Creating a variable to hold the alpha (transparency) value we want to set for the current pixel. Defaulting
                    // this to 255 so that pixels appear opaque by default
                    var pixelAlpha = 255;

                    // If the saturation and brightness are above 30, then this is a green pixel
                    if (pixelSaturation > 30 && pixelBrightness > 20) {
                        // Set this pixel in the keyedImage to be transparent (Removing the main areas of the green)
                        pixelAlpha = 0;
                    } else {
                        // Even though this pixel falls within the green range of the colour spectrum, it's saturation and brightness
                        // are low enough that it is unlikely to be a part of the green screen, but may just be an element of the scene
                        // that is picking up a glow off the green screen. Lowering the hue and saturation to remove the green tinge 
                        // from this pixel.
                        hsvCol = "hsv(" + pixelHue * 0.6 + ", " + pixelSaturation * 0.3 + "%, " + pixelBrightness + "%)";
                    }

                    var pixelRed = Math.round(onecolor(hsvCol).red() * 255);
                    var pixelGreen = Math.round(onecolor(hsvCol).green() * 255);
                    var pixelBlue = Math.round(onecolor(hsvCol).blue() * 255);

                    var newColor = Jimp.rgbaToInt(pixelRed, pixelGreen, pixelBlue, pixelAlpha);

                    keyedImage.setPixelColor(newColor, x, y);
                }
            });

            console.log("Green screen keying completed in " + ((Date.now() - keyingImageStarted) / 1000) + " seconds");

            finishImage(keyedImage, originalImage, cb);
        });
    }
    ,
    HD: function (originalImage, cb) {
        // Lower Quality Result - Takes approximatley 8 seconds to process
    
        // Using the Jimp package to read in an image
        Jimp.read("./" + originalImage, function (err, cameraImage) {
            if(err){
                console.log(err);
            }
            console.log("Image loaded");

            console.log("Removing green screen in HD...");

            var keyingImageStarted = Date.now();
    
            // Creating a variable in which to store the keyed version of the image passed in. Defaulting this
            // to be equal to a clone of the original image, so that pixels which are not detected as green
            // will remain as they were originally without having to be set again
            var keyedImage = cameraImage.clone();

            // Using the Jimp package's scan() method to go through every pixel in the image that was passed in.
            // Basically this method is like having one loop to increment the x, and an inner loop to increment
            // the y, so that each pixel can be accessed individually, with reference to it's position in the
            // original image
            cameraImage.scan(0, 0, cameraImage.bitmap.width, cameraImage.bitmap.height, function (x, y, idx) {

                // Getting the colour of the current pixel (as an integer) and converting it to an RGBA
                // (Red, Green, Blue, Alpha) object
                var pixelColorObject = Jimp.intToRGBA(cameraImage.getPixelColor(x, y));
        
                // Using the properties of the pixelColorObject to create a new RGB (Red, Green, Blue)
                // string, so that the onecolor package will recognise it as a color
                var pixelColor = "rgb(" + pixelColorObject.r + ", " + pixelColorObject.g + ", " + pixelColorObject.b + ")";

                // Using the onecolor package to get the hue of the pixel colour (which returns a decimal value between
                // 0 and 1). Multiplying this value by 360 to map it to this more commonly used range for hues in the 
                // color specturm
                var pixelHue = onecolor(pixelColor).hue() * 360;
        
                // If the hue of this pixel falls anywhere within the range of green in the colour spectrum
                if (pixelHue > 60 && pixelHue < 180) {

                    // Only getting the saturation and brightness of the pixel now, as until we determine whether
                    // the current pixel was green or not, there was no point in taking up additional time/memory
                    var pixelSaturation = onecolor(pixelColor).saturation() * 100;
                    var pixelBrightness = onecolor(pixelColor).value() * 100;

                    // Creating a variable to hold the HSV (Hue, Saturation, Value) - also known as HSB (Hue, Saturation,
                    // Brightness) colour we want to set this pixel to. Defaulting this to be equal to the original colour
                    // of the pixel. Writing this variable as a string, in a format that onecolor will recognise as a color,
                    // so we can later cast it back to RGB (Red, Green, Blue) so the Jimp package can then cast it to an 
                    // integer before setting this as the colour for the current pixel (as Jimp pixels only accept integer values)
                    var hsvCol = "hsv(" + pixelHue + ", " + pixelSaturation + "%, " + pixelBrightness + "%)";
            
                    // Creating a variable to hold the alpha (transparency) value we want to set for the current pixel. Defaulting
                    // this to 255 so that pixels appear opaque by default
                    var pixelAlpha = 255;
 
                    // If the saturation and brightness are above 30, then this is a green pixel
                    if (pixelSaturation > 30 && pixelBrightness > 30) {
                        // If the hue of the pixel is between 90 and 100, this is not fully green, but with a tinge 
                        if (pixelHue > 90 && pixelHue < 100) {
                            // This seems to effect the girl's hair on the left
                            // Lowering the hue, saturation and opacity, to reduce the intensity of the colour
                            hsvCol = "hsv(" + pixelHue * 0.3 + ", " + pixelSaturation * 0.4 + "%, " + pixelBrightness + "%)";
                            pixelAlpha = 200;
                        } else if (pixelHue > 155) {
                            // Increasing the hue, and reducing the saturation
                            hsvCol = "hsv(" + pixelHue * 1.2 + ", " + pixelSaturation * 0.5 + "%, " + pixelBrightness + "%)";
                        } else if (pixelHue < 115) {
                            // Reducting the hue and saturation. Fixes the girl's hair (in greenScreenImage1) but adds in some of
                            // the green screeen in greenScreenImage2)
                            hsvCol = "hsv(" + pixelHue * 0.4 + ", " + pixelSaturation * 0.5 + "%, " + pixelBrightness + "%)";
                        } else {
                            // Creating variables to store the hue of the pixels surrounding the current pixel.
                            // Defaulting these the be equal to the current pixels hue, and only changing them if
                            // the current pixel is away from the edge of the picture
                            var pixelHueToLeft = pixelHue;
                            var pixelHueToRight = pixelHue;
                            var pixelHueAbove = pixelHue;
                            var pixelHueBelow = pixelHue;
 
                            // If the current pixel is not near the edge of the image, changing the values of the variables
                            // for the pixels around it to get their hue values
                            if (x > 0 && x < cameraImage.bitmap.width - 1 && y > 0 && y < cameraImage.bitmap.height - 1) {
                                var pixelColLeft = "rgb(" + Jimp.intToRGBA(cameraImage.getPixelColor(x - 1, y)).r + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x - 1, y)).g + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x - 1, y)).b + ")";
                                var pixelColRight = "rgb(" + Jimp.intToRGBA(cameraImage.getPixelColor(x + 1, y)).r + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x + 1, y)).g + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x + 1, y)).b + ")";
                                var pixelColAbove = "rgb(" + Jimp.intToRGBA(cameraImage.getPixelColor(x, y - 1)).r + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x, y - 1)).g + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x, y - 1)).b + ")";
                                var pixelColBelow = "rgb(" + Jimp.intToRGBA(cameraImage.getPixelColor(x, y + 1)).r + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x, y + 1)).g + ", " + Jimp.intToRGBA(cameraImage.getPixelColor(x, y + 1)).b + ")";
                                pixelHueToLeft = onecolor(pixelColLeft).hue() * 360;
                                pixelHueToRight = onecolor(pixelColRight).hue() * 360;
                                pixelHueAbove = onecolor(pixelColAbove).hue() * 360;
                                pixelHueBelow = onecolor(pixelColBelow).hue() * 360;
                            }
                    
                            // If the pixels around this pixel are in the more intense are of green, then assume this is part of the green screen
                            if (pixelHueToLeft > 90 && pixelHueToLeft < 150 && pixelHueToRight > 90 && pixelHueToRight < 150 && pixelHueAbove > 90 && pixelHueAbove < 150 && pixelHueBelow > 90 && pixelHueBelow < 150) {
                                // Set this pixel in the keyedImage to be transparent (Removing the main areas of the green)
                                pixelAlpha = 0;
                            } else if (pixelHue > 130) {
                                // This seems to be the edges around the girl
                                // Increasing the hue, reducing the saturation and displaying the pixel at half opacity
                                hsvCol = "hsv(" + pixelHue * 1.1 + ", " + pixelSaturation * 0.5 + "%, " + pixelBrightness + "%)";
                                pixelAlpha = 150;
                            } else {
                                // Set this pixel in the keyedImage to be transparent (Removing the main areas of the green)
                                pixelAlpha = 0;
                            }
                        }
                    } else {
                        // Even though this pixel falls within the green range of the colour spectrum, it's saturation and brightness
                        // are low enough that it is unlikely to be a part of the green screen, but may just be an element of the scene
                        // that is picking up a glow off the green screen. Lowering the hue and saturation to remove the green tinge 
                        // from this pixel.
                        hsvCol = "hsv(" + pixelHue * 0.6 + ", " + pixelSaturation * 0.3 + "%, " + pixelBrightness + "%)";
                    }

                    var pixelRed = Math.round(onecolor(hsvCol).red() * 255);
                    var pixelGreen = Math.round(onecolor(hsvCol).green() * 255);
                    var pixelBlue = Math.round(onecolor(hsvCol).blue() * 255);

                    var newColor = Jimp.rgbaToInt(pixelRed, pixelGreen, pixelBlue, pixelAlpha);

                    keyedImage.setPixelColor(newColor, x, y);
                } else {
                    // Since this pixel did not fall within any of the wider ranges of green in the colour spectrum,
                    // we are not going to effect it's pixel colour value
                }

            });
            console.log("Green screen keying completed in " + ((Date.now() - keyingImageStarted) / 1000) + " seconds");

            finishImage(keyedImage, originalImage, cb);
        });
    }
};

// Composite the image (if necessary) and save to the server as a PNG
function finishImage(finalImage, originalImagePath, cb) {
    var withBlackBackground = new Jimp(finalImage.bitmap.width, finalImage.bitmap.height, 0x000000FF, function (err, image) {
        // This is a plain black image, the same size as the original image passed in. Using this
        // temporarily to composite the keyed image onto, to test that the keying looks clean
    });
    
    // Placing the final image ontop of the black backgroun (for testing purposes to see the edges)
    withBlackBackground.composite(finalImage, 0, 0);

    var savingImageStarted = Date.now();
    
    // Saving the image to the server
    withBlackBackground.write("./images/KeyedImage.png", function () {
        console.log("Image saved in " + ((Date.now() - savingImageStarted) / 1000) + " seconds");
        
        // Calling the callback function, so that the index route can now respond with the keyed image url
        cb();
        
        fs.unlink(originalImagePath, function(err){
            if(err){
                console.log("Could not delete file - " + err);
            } else {
                console.log("Deleted " + originalImagePath);
            }
        });
    });
}

module.exports = RemoveGreenScreenFunctions;