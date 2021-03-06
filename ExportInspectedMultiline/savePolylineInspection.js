/// <reference path="C:\Program Files\Leica Geosystems\Cyclone 3DR 19.1\Script\JsDoc\Reshaper.d.ts"/>


function GetContentData(
    _iDataStructure // the label
    )
{
    // all field in a trsucture
    var keys = Object.keys(_iDataStructure[0]);
    //print(keys);
    var Header = "";
    for(ik=0; ik<keys.length; ik++)
        Header += keys[ik] + ";";
    Header += "\n";
    //print(Header)

    var ToReturn = new String();
    ToReturn += Header;

    // print(Object.getOwnPropertyDescriptor(_iDataStructure[0], keys[1]).value)
    for (var idxData = 0; idxData < _iDataStructure.length; idxData++)
    {
        for(ik=0; ik<keys.length; ik++)
            ToReturn += Object.getOwnPropertyDescriptor(_iDataStructure[idxData], keys[ik]).value + ";";

        ToReturn += "\n";
    }

    // and of the csv file line
    ToReturn += "\n";
    return ToReturn;
}

function SaveContentData(file2Save, content)
{
    var file = SFile.New( file2Save );
    // save the data
    if ( !file.Open( SFile.WriteOnly ) )
        ErrorMessage( 'Failed to write file:' + fileName ); // test if we can open the file
        
    // write the smultiline in the file
    file.Write( content );
    // Close the file
    file.Close();
}


function main()
{
    var selSections = SMultiline.FromSel();
    if(selSections.length!=1)
        throw new Error("Select 1 polyline")

    var selSection = selSections[0];
    var OutArray = new Array

    for(var iPt = 0; iPt<selSection.GetNumber(); iPt++)
    {
        var thePt = selSection.GetPoint(iPt);
        var Dev = selSection.GetDeviation(iPt);
        if(Dev>1e37)
            Dev = NaN;
        
        var DataPoint = {
            'X': thePt.GetX(),
            'Y': thePt.GetY(),
            'Z': thePt.GetZ(),
            'Dev': Dev}
        OutArray.push(DataPoint)
    }

    var theContent = GetContentData(OutArray);
    print(theContent)

    var DefaultPath = CurrentScriptPath()
    var CSVfile = GetSaveFileName("CSV file to save", "*.csv", DefaultPath);
    if ( CSVfile.length==0 )
        ErrorMessage( 'Cancelled by user' );

    SaveContentData(CSVfile, theContent);
}

main();