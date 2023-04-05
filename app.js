//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

mongoose.connect("mongodb+srv://rideryashk:pragati@cluster0.njhv4dv.mongodb.net/ptodolistDB",{useNewUrlParser:true});




const itemsSchema={
  name:String
}
const Item=mongoose.model("Item",itemsSchema);

const item1= new Item({name:"Welcome "});
const item2= new Item({name:" hit the + button to add new item"});
const item3= new Item({name:" <-- hit this to delete"});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
   
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
       Item.insertMany(defaultItems).then(function(){
          console.log("inserted")
        }).catch(function(error){
          console.log(error);
        });
        res.redirect("/");
    }

    res.render("list", { listTitle: "Today", newListItems: foundItems });
  })
  .catch(function(err){
    console.log(err);
  });

 

});


app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  

  List.findOne({name:customListName} )
 .then((foundList)=>{
    if(!foundList){
      // create new list
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
       res.redirect("/"+customListName);
    }
    else{
     res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
 })
 .catch((err)=>{
     console.log(err);
 });

  
})

app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  })
  
  if(listName==="Today"){
         item.save();
         res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
  })
  .catch((err)=>{
      console.log(err);
  });
  }

  
});

app.post("/delete",function(req,res){
 
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() =>{
        console.log('has been deleted')
        res.redirect("/");
    })
    .catch(err=>{console.log(err)})
  }
  else{
    List.findOneAndUpdate({name:listName}, 
      {$pull:{items:{_id:checkedItemId}}}, null, function (err,foundList) {
      if (err){
          console.log(err)
      }
      else{
          res.redirect("/"+listName);
      }
  });

  
  }



});
 


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
