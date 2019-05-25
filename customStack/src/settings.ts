
module powerbi.extensibility.visual {
  "use strict";
  import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
  export class CircleSettings {
    public text_postive:string ='green';
    public text_negative:string ='red'
    public axis_text_size:number= 14;
    public bar_text_size:number= 15;
    public rect_text_size:number= 15;
    public legend_text_size:number=25;
 
   }
    export class VisualSettings extends DataViewObjectsParser {
      public Arc: CircleSettings = new CircleSettings();
        }
   
   

}