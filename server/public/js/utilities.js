var Utilities = {
    random: function(minimum, maximum) {
        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    },
    sort: function(array, key) {
        for (i = 0; i < array.length; i++) {
            for (j = 0; j < array.length; j++) {
                if (array[i][key] > array[j][key]) {
                    temporarySortItem = array[i];
                    array[i] = array[j];
                    array[j] = temporarySortItem;
                }
            }
        }  
    },
    
};