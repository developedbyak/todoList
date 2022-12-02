const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();




app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://itsmeak:passwordakash@cluster0.8h2pnt9.mongodb.net/todolistDB");



// Mongoose Schema
const itemsSchema = {
    name: String
};


const listSchema = {
    name: String,
    items: [itemsSchema]
};


// Mongoose Model
const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);


// Mongoose Document
const item1 = new Item({
    name: "test list one"
});
const item2 = new Item({
    name: "test list two"
});
const item3 = new Item({
    name: "test list three"
});

const defaultItems = [item1, item2, item3];








// Mongoose find()

// Item.find({_id:"63888184aac8700b36a229a6"},function(err, items){
//     if (err){
//         console.log(err);
//     } else {
//         items.forEach(function(item){
//             console.log(item.name);
//         });
//     }
// });






app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            //Mongoose insertMany()
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("sucessfully updated items");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });
});





app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });
    if (listName === "Today"){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
   
});



app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Item removed sucessfully");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate (
            {name: listName},
            {$pull: {items: {_id: checkedItemId}}},
            function(err, foundList){
                if(!err){
                    res.redirect("/"+ listName);
                }
            }
        )
    }

   
});




app.get("/:customListName", function (req, res) {
    const customListName =_.capitalize(req.params.customListName);
    console.log(customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                console.log("Doesn't exist! creating one ");
                list.save();
                res.redirect("/" + customListName);
            } else {
              //  show an existing list
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
                console.log("Exists!");
            }
        }

    });
});


app.get("/about", function (req, res) {
    res.render("about");
})




app.listen(3000, function () {
    console.log("server started on port 3000");
});