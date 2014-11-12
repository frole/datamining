
/* Affecte un tablau à un autre */
function affectArray(tab){
    var result = [];
    $.each(tab, function(i, e) {
      result.push(e);
    });
    return result;
   };

/* recupere les valeur d'un tableau sans les doublon */
function uniqueArray(tab) {
    var result = [];
    $.each(tab, function(i, e) {
      if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
   };
   
/* recupere les label des lignes ou des colonnes appartenant à une classe donnèe */
function getLabelClass(tab,vectClass,classe) {
    var result = [];
    $.each(tab, function(i, e) {
      if (vectClass[i] == classe) result.push(e);
    });
    return result;
   };
   
/* recuperer l'indice du debut d'un bloc*/

function getIndexStartBloc(val,classvect)
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

function getNbElementClass(classindex,classvect)
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
function getNbElementClassV2(classindex,classvect)
{
 var frequency;
 
 frequency = classvect.lastIndexOf(classindex) - classvect.indexOf(classindex) +1;
 
 return frequency;
}



/* recuperer la matrice d'un bloc */

function getBlocMatrix(mat,i,j,lineclass,colclass)
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

/* calculer la matrice rèsumer de la matrice reordonner en utilisant "Pkl/Pk.*P.l" */

function getSummaryMatrix(matrix,lineclass,colclass)
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


/*récuperer les nom des colonnes */
function getLibelletCol(blocindexI,blocindexJ,colname)
{

}
/*récuperer les nom des ligne */
function getLibelletRow(blocindexI,blocindexJ,rowname)
{

}

/* récuperer les top termes */
function comp(x, y) {
    return y.sum - x.sum;
}
function getTopTermRowCol(i,j,matrice,colclass,lineclass,rowname,colname,nbtoptermRow, nbtoptermCol)
{
	if(nbtopterm > rowname.length)
	{
		return rowname;
	}
    var firstindexlinebloc;
    var firstindexcolbloc;
    var lastindexlinebloc;
    var lastindexcolbloc;
    var sum = 0;
	var topterm = new Object();
	var toptermCol = new Array;
	var toptermRow = new Array;
    var tabrow = new Array;
	var tabcol = new Array;

    lastindexlinebloc = lineclass.lastIndexOf(i);
    lastindexcolbloc = colclass.lastIndexOf(j);
    firstindexlinebloc = lineclass.indexOf(i);
    firstindexcolbloc = colclass.indexOf(j);

    for (a = firstindexlinebloc; a<= lastindexlinebloc;a++)
    {
        for (b = firstindexcolbloc; b<= lastindexcolbloc;b++)
        {
            sum = sum + (mat[a][b]);
        }
		
        tabrow.push({"libelle":rowname[a],"sum":sum});
		sum = 0;
    }
	tabrow.sort(comp);
	for (b = firstindexcolbloc; b<= lastindexcolbloc;b++)
    {
		 for (a = firstindexlinebloc; a<= lastindexlinebloc;a++)
		{
			sum = sum + (mat[a][b]);
		}
		tabcol.push({"libelle":rowname[a],"sum":sum});
		sum = 0;
    }
	tabcol.sort(comp);
	
	for(var k=0;k<=nbtoptermRow;k++)
	{
		toptermRow.push(tabrow[k]);
	}
	
	for(var k=0;k<=nbtoptermCol;k++)
	{
		toptermCol.push(tabcol[k]);
	}
	
	topterm = {"topTermRow":toptermRow,"topTermCol":toptermCol};
	
	
    return topterm; 
}
 







