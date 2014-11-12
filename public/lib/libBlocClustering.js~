/* Affecte un tablau à un autre */
var affectArray = function (tab){
    var result = [];
    tab.foreach(function(i, e) {
      result.push(e);
    });
    return result;
   };
exports.affectArray = affectArray;
/* recupere les valeur d'un tableau sans les doublon */
var uniqueArray = function uniqueArray(tab) {
    var result = [];
     tab.foreach(function(i, e) {
      if (!(e in result)) result.push(e);
    });
    return result;
   };
 exports.uniqueArray = uniqueArray;  
/* recupere les label des lignes ou des colonnes appartenant à une classe donnèe */
exports.getLabelClass = function getLabelClass(tab,vectClass,classe) {
    var result = [];
    tab.foreach(function(i, e) {
      if (vectClass[i] == classe) result.push(e);
    });
    return result;
   };
   
/* recuperer l'indice du debut d'un bloc*/

exports.getIndexStartBloc = function getIndexStartBloc(val,classvect)
{
   for(i = 0;i <classvect.length;i++)
   {
       if(classvect[i] == val)
       {
           return i;
       }       
   }
return -1;
}

/* recuperer le nombre d'element d'une class */

exports.getNbElementClass = function getNbElementClass(classindex,classvect)
{
 var startindex;
 var frequency = 0;
 startindex = classvect.indexOf(classindex);
 for(i = startindex;i<classvect.length;i++)
 {
    if(classvect[i] == classindex)
    {
        frequency++;
    }
    else
    {
       return frequency;
    }   
 }
 return -1;
}

/* recuperer le nombre d'element d'une class version 2 */
exports.getNbElementClassV2 = function getNbElementClassV2(classindex,classvect)
{
 var frequency;
 
 frequency = classvect.lastIndexOf(classindex) - classvect.indexOf(classindex) +1;
 
 return frequency;
}



/* recuperer la matrice d'un bloc */

var getBlocMatrix  = function(mat,i,j,lineclass,colclass)
{
    var firstindexlinebloc;
    var firstindexcolbloc;
    var lastindexlinebloc;
    var lastindexcolbloc;
    var submat = new Array;
    var tab = new Array;

    lastindexlinebloc = lineclass.lastIndexOf(i);
    lastindexcolbloc = colclass.lastIndexOf(j);
    firstindexlinebloc = lineclass.indexOf(i);
    firstindexcolbloc = colclass.indexOf(j);

    for (a = firstindexlinebloc; a<= lastindexlinebloc;a++)
    {
        for (b = firstindexcolbloc; b<= lastindexcolbloc;b++)
        {
            tab.push(mat[a][b]);
        }
        submat.push(tab);
        tab = new Array;
    }   
    return submat; 
}
exports.getBlocMatrix = getBlocMatrix;

/* calculer la matrice rèsumer de la matrice reordonner en utilisant "Pkl/Pk.*P.l" */

var getSummaryMatrix = function(matrix,lineclass,colclass)
{
    var lineclassindex = uniqueArray(lineclass);
    var colclassindex = uniqueArray(colclass);
    var summarymatrix = new Array;
    var tab = new Array;
    var sum;
    var submat = new Array;
    for(i = 0; i < lineclassindex.length;i++)
    {
        for(j=0; j < colclassindex.length;j++)
        {  
            console.log(j);
            submat = getBlocMatrix(matrix,i,j,lineclass,colclass);
            sum = matrixSum(submat);
            tab.push(sum);
            submat = new Array;
            console.log(j);
        }   
        summarymatrix.push(tab);
        tab = new Array;    
    }
    return summarymatrix;   
}
exports.getSummaryMatrix = getSummaryMatrix;

/* somme d'une matrice >*/

function matrixSum(mat)
{
    var sum = 0;

    for (a =0;a<mat.length;a++)
    {
        for (b =0;b<mat[a].length;b++)
        {
            sum = sum + mat[a][b];
        }
    }
    return sum;
}
