define([
    'base/js/namespace',
    'base/js/keyboard',
    'jquery',
    'require',
    'base/js/events',
    'base/js/utils',
], function(Jupyter, keyboard$, requirejs, events, configmod, utils) {
    "use strict";

    var insert_cell = function() {
        // Define cells here
       Jupyter.notebook.insert_cell_above('markdown')
                        .set_text(`## Central notebook  
You can copy and paste any important code and markdown notes you want from other notebooks from the follow instructions.`);
        Jupyter.notebook.select_prev();
        Jupyter.notebook.execute_cell_and_select_below();
        Jupyter.notebook.insert_cell_above('markdown')
                        .set_text(`### Brief Instruction
（You can see his detailed introduction in the extension interface ）   
a. Tag cells : after clicking on the cell you want, you can use the keyboard shortcut "control+e" to mark it  
b. Copy cells: add a copy toolbar button for copy all cells you selected  
c. Paste cells: add a list toolbar button for insert all cells you copy`);
       Jupyter.notebook.select_prev();
       Jupyter.notebook.execute_cell_and_select_below();
       Jupyter.notebook.insert_cell_above('markdown')
       .set_text(`### Notice    
1.If you find that your running result reports an error, it may be because you did not copy and paste the code associated with it before.   
2.Make sure your files are always running, don't refresh.`);
Jupyter.notebook.select_prev();
Jupyter.notebook.execute_cell_and_select_below();
     };
    
    
    var cell_indices=[];
    var add_copy_cell=function(){
        var s = Jupyter.notebook.get_selected_cells_indices();  
        cell_indices.push(s);   
    };

    var delete_copy_cell=function(){
        var s = Jupyter.notebook.get_selected_cells_indices();     
        for(var i = 0; i < cell_indices.length; i++){
            $.each(cell_indices,function(index,item){
                console.log(item);
                if(item[0] == s[0]){
                    cell_indices.splice(index,1);
                }
            });
        }
        console.log(cell_indices.length);
    };

    var add_cmd_shortcuts = {
        'Ctrl-e': {
            help: 'Copy select cells',
            help_index: 'ht',
            handler: add_copy_cell
        },
        'Ctrl-q': {
            help: 'deleted copy cells',
            help_index: 'ht',
            handler: delete_copy_cell
        }
    }

    var CopySelectCellButton = function(){
        Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register({
                'help': 'Copy Select Cells',
                'icon': 'fa fa-clone',
                'handler': function () {
                    localStorage.clear();  
                    for (var i=0; i < cell_indices.length; i++) {
                        var cell = Jupyter.notebook.get_cell(cell_indices[i]);
                        cell = JSON.stringify(cell); 
                        if (cell.id !== undefined) {
                            delete cell.id;
                        }
                        var cellname = "jscell"+i
                        localStorage.setItem(cellname, cell); 
                    }
                    cell_indices=[];
                }
            }, ),
        ]);
    };

    var palseSelectCellButton = function () {
        Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register({
                'help': 'Insert Cell Above',
                'icon': 'fa fa-th-list',
                'handler': function () {
                    for(var i =0; i <localStorage.length; i++){
                        var cellname = "jscell"+i
                        var cellcode = localStorage.getItem(cellname)
                        var cell = JSON.parse(cellcode); //Convert to JSON
                        Jupyter.notebook.insert_cell_below(cell.cell_type).set_text(cell.source)
                        Jupyter.notebook.select_next();
                        Jupyter.notebook.execute_cell();
                    }
                    localStorage.clear();  
                }
            }, ),
        ]);
    };

    function load_ipython_extension() {
        localStorage.clear(); 
        if (Jupyter.notebook.get_cells().length===1){
            insert_cell();
        }
        Jupyter.keyboard_manager.command_shortcuts.add_shortcuts(add_cmd_shortcuts);
        console.log("[copy_selected_cells] loaded")
        CopySelectCellButton();
        palseSelectCellButton();
    }

    return {
        load_ipython_extension: load_ipython_extension,
    };
});
