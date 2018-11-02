function mapping(){
    var item;
    var x = document.forms['tagform']['tagselect'].value;
    for(item in result1){
        if(x==item.TagName){
          tagvalue = item.Tagid;
          break;
        }
    }
    for(item in result2){
        if(tagvalue==item.Tagid){
          postid = item.Postid;
          break;
        }
    }
}
