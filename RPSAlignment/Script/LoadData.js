
/// @brief
/// Open an Rsh file
function LoadRsh( fileName )
{
	if (typeof fileName !== 'string')//if no string is transmit to the function
		fileName = GetOpenFileName("Open File", "RSH file (*.rsh)");
		
	if(fileName.length == 0) 
		throw new Error('Impossible to continue, no file selected.');
		
	var rshLoadRes = OpenRsh(fileName, true);
	if(rshLoadRes.ErrorCode != 0) 
		throw new Error('Error when loading rsh file: ' + fileName);
}

/// @brief
/// Open a cloud file and add the content of the file inside the current document
function LoadCloud( name, fileName )
{
	if (typeof fileName !== 'string')//if no string is transmit to the function
		fileName = GetOpenFileName("Open File", "NSD file (*.nsd)");
		
	if(fileName.length == 0) 
		throw new Error('Impossible to continue, no file selected.');
  
	var cloudLoadRes = SCloud.FromFile(fileName);
	if(cloudLoadRes.ErrorCode != 0) 
		throw new Error('Error when loading nsd file: ' + fileName);
		
	if(cloudLoadRes.CloudTbl.length != 1) 
		throw new Error('There isn\'t only one cloud in the file: ' + fileName);
		
	// adding to the doc
	var theCloud = cloudLoadRes.CloudTbl[0];
	theCloud.SetName(name);
	theCloud.SetRepresentationType(SCloud.SMOOTH);
	theCloud.AddToDoc();
	return theCloud;
}
