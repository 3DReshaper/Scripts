# Highest Points Cloud Extractor

In some uses cases, we have very special physical object structures like part with Honeycomb structure, it is not really easy to handle meshing creation for this kind of sample as thinkness is too low and we have a lot of point.

Other use case present today on the market is to create a fitting surface using the highest points of the cloud.

This can be done with 3DReshaper Meteor through a script , this script will:

- create a grid using the boundingBox of the selected cloud
- Separate the cloud on a small parts of cloud
- Extract for each part of the cloud , the highest point  and create a cloud as a reslut.
- Hide the original cloud

To use the scripts, open the script editor and load js file, import your mesh(es), select it and run the script like if you were running a 3DReshaper command. 

Once done you can select your cloud and create a 3DMesh and smooth it using these parameters:
- Keep all the points + Try to keep only external border
- Smooth your mesh with a value of smooth intensity of 10.

For more information, contact us: support at 3DReshaper.com
![alt text](https://raw.githubusercontent.com/3DReshaper/Scripts/master/Highest%20Points%20Cloud%20Extractor/Screenshot.png "screenshot")

# Download Files

You can download individual file using these links (for text file, right click on the link and choose "Save as..."):
- [ExtractHpoints.js] (https://raw.githubusercontent.com/3DReshaper/Scripts/master/Highest%20Points%20Cloud%20Extractor/ExtractHpoints.js)
- [Extract_Hpoints.rsh] (https://raw.githubusercontent.com/3DReshaper/Scripts/master/Highest%20Points%20Cloud%20Extractor/Extract_Hpoints.rsh)
Or all scripts on this site can be download in a [single zip file] (https://github.com/3DReshaper/Scripts/archive/master.zip).