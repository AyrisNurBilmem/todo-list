//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //1
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser : true}); //2


//                                     SCHEMAS
const itemSchema = { //3
  name: String
};

const Item = mongoose.model("Item",itemSchema); //4

//6 (create 3 new items)
const item1 = new Item({
  name: "Welcome to your todo list"
});

const item2 = new Item({
  name: "Hit + to add new items into the list"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

//7 (create an array)
const defaultItems = [item1, item2, item3];

//8 (insert many)



//23 (create new schema)
const listSchema ={
   name : String,
   items: [itemSchema]
};

const List = mongoose.model("List", listSchema);






//                                 GET ROUTES

//12 (eğer array boşssa insert ve ana sayfaya geridön sonra else e gir ve render yap) (doluysa direkt else' e gir)
app.get("/", function(req, res) {

  //9 (console.log all the items)

Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems,  function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully added!");
      }
    });
    res.redirect("/");
  }
 
  else {
      // 5 (delete everything about day just write listTitle:"Today")
  res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
    

});



});



//22(create a dynamic route )
app.get("/:topic", function(req, res){
  const customListName = _.capitalize(req.params.topic);
   
  //25

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
    if(!foundList){
      //create list
      const list = new List({
        name: customListName,
        items: defaultItems
    });
      list.save();
      res.redirect("/" + customListName);
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      //show an existing list
    }
    }
   
  
    });
  

  //24 (create the new list items here)
 
  //list.save();

});






//                         POST ROUTES

app.post("/", function(req, res){
 //13(create a new item)
  const itemName = req.body.newItem;
  const listName = req.body.list;   //27 (add listName here)
 
  const item = new Item({
    name: itemName
  });

  //28
  if(listName === "Today"){
    item.save();
    res.redirect("/"); //bunu yaaprsak home route ı okur tekrar ve ekler array'e ve görürüz ekranda

  }
  else{
    List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName); //to the custom list
    });
  }
  

});
//17 (create a "/delete" route)
app.post("/delete", function(req, res){
 
  //console.log(req.body.checkbox); //19 (.checkbox)

  //21 (delete the checked item)
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
   
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted the checked item!");
        res.redirect("/"); //sildikten  sonra geriye kalanları tekrar göstersin diye
      }
  });
     }
      else{
         List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},function(err, foundList){
           if(!err){
            res.redirect("/" + listName);
           }
         });
             
          }
        
    
  
  });


  //            OR USE THE OLD ONE BELOW
  /*Item.deleteOne({_id: checkedItemId}, function(err){
    if(err){
      console.log(err);
    }
    res.redirect("/");
  });*/





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
