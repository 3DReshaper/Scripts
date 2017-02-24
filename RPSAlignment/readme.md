# RPS alignment

This script shows how to make an alignment of a mechanical part using the RPS method in 3DReshaper. 

To use it, open the script editor and load RPSAlignment.js,

The script requests to click points on the scene (3 for the first plane, 2 for the second plane, 1 for the last one). 
For each series of points, the script shows a red plane in the model. The  user has to click points on this plane on the scanned data. Once the user 
selects 6 points, the alignment is computed. A best fit is then applied. 
 
Once the part is well aligned, the script does :
 - a comparison between 2 planes
 - an extraction of 2 concentric cylinders
 - an extraction of a circle concentric to the cylinders
 - an inspection of the face with a free form
 - create some lables with distance and point coordinates

 For more information, contact us support at 3DReshaper\.com

![alt text](https://raw.githubusercontent.com/3DReshaper/Scripts/master/RPSAlignment/Screenshot.png "screenshot")

# Download Files

You can download individual file using these links (for text file, right click on the link and choose "Save as..."):

- [RPSAlignment.js] (https://raw.githubusercontent.com/3DReshaper/Scripts/master/RPSAlignment/RPSAlignment.js)
- [RPSOnRef.rsh] (https://raw.githubusercontent.com/3DReshaper/Scripts/master/RPSAlignment/RPSOnRef.rsh)

Or all scripts on this site can be download in a [single zip file] (https://github.com/3DReshaper/Scripts/archive/master.zip).

