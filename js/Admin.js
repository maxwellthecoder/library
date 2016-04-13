$("#date-requested").val(moment().format("YYYY-MM-DD"));
$("#date-requested").attr("min", moment().format("YYYY-MM-DD"));


$.ajax
({
    method: "GET",
    url: "StudentFile.csv",
    dataType: "text",
    success: function(data){processData(data)}
});

var csvData;

var processData = function(csv)
{
    csvData = $.csv.toObjects(csv);
};

var searchByID = function(data, id)
{
    //var resultsArray = [];

    for(var key in data)
    {
        if(data[key].id === id)
        {
            addToSigninTable(data[key]);
        }

    }

    //console.log(resultsArray);
};

var searchByLastName = function(data, last_name)
{
    for(var key in data)
    {

        if(data[key].last_name.toLowerCase().replace("'", "").indexOf(last_name.toLowerCase()) >= 0)
        {
            addToSigninTable(data[key]);
        }

    }
}

var addToSigninTable = function(data)
{
    $("#signin_table tbody").append("<tr><td>" + data.first_name + "</td><td>" + data.last_name + "</td><td>" + data.homeroom + "</td><td>" + data.id + "</td><td>" + data.grade + "</td><td><a id='" + data.id + "' href='#' class='checkIn_btn btn-sm btn-success'>Check in</a></td></tr>");
};

$("body").on("click", "a.checkIn_btn", function(e)
{
    e.preventDefault();

    var id = this.id;
    var studentData;
    var currentPeriod = $("#period_signin").val();
    var hadAPass = false;


    var date = moment().format("YYYY-MM-DD");

    for(var key in csvData)
    {
        if(csvData[key].id === id)
        {
            studentData = csvData[key];
        }
    }

    $.ajax
        ({
            method: "POST",
            url: "getPasses.php",
            data: {isValidRequest: true, period: currentPeriod, date: date}
        })
        .done(function (result) {
            var passArray = $.parseJSON(result);

            for(var key in passArray)
            {
                console.log(passArray[key][0].toLowerCase() +"==="+ studentData.first_name.toLowerCase() + ", " + passArray[key][1].toLowerCase() +"==="+ studentData.last_name.toLowerCase());
                if(passArray[key][0].toLowerCase() === studentData.first_name.toLowerCase() && passArray[key][1].toLowerCase() === studentData.last_name.toLowerCase())
                {
                    hadAPass = true;
                }
                console.log(passArray[key][0].toLowerCase() +"==="+ studentData.first_name.toLowerCase() + ", " + passArray[key][1].toLowerCase() +"==="+ studentData.last_name.toLowerCase());
                console.log(hadAPass);
            }

            $.ajax
                ({
                    method: "POST",
                    url: "checkIn.php",
                    data: {isValidRequest: true, first_name: studentData.first_name, last_name: studentData.last_name, student_id: id, homeroom: studentData.homeroom, grade: studentData.grade, hadAPass: hadAPass, currentPeriod: currentPeriod}
                })
                .done(function (result) {

                    if(result !== "success")
                    {
                        console.log(result);
                    }
                    else
                    {
                        $("#lib_signin").trigger("reset");
                        $("#signin_table tbody tr").remove();

                        $("#signin_alert").html("<strong>Success</strong> " + studentData.first_name + " " + studentData.last_name + " has been checked in.");
                        $("#signin_alert").fadeIn(100).delay(1000).fadeOut(100);
                    }

                });

        });




});

$("#studentID").keyup(function()
{
    $("#signin_table tbody tr").remove();

    var studentID = $("#studentID").val();
    if(studentID.length === 5)
    {
        searchByID(csvData, studentID);
    }

});

$("#last_name").keyup(function()
{
    $("#signin_table tbody tr").remove();

    var last_name = $("#last_name").val();

    if(last_name != "")
    {
        searchByLastName(csvData, last_name);
    }

});


var getPasses = function(date, period)
{
    $("#admin_table tbody tr").remove();

    $.ajax
        ({
            method: "POST",
            url: "getPasses.php",
            data: {isValidRequest: true, period: period, date: date}
        })
        .done(function (result) {
            //if(typeof result != "object")
            //{
               // console.log(result + "lol");
            //}
            //else
            //{
                var passArray = $.parseJSON(result);

                 for(var key in passArray)
                 {
                     $("#admin_table tbody").append("<tr><td>" + passArray[key][0] + "</td><td>" + passArray[key][1] + "</td><td>" + passArray[key][2] + "</td><td>" + passArray[key][3] + "</td></tr>");
                 }
           // }


        });
}

var date = $("#date-requested").val();
var period = $("#period").val();

getPasses(date, period);

$("#date-requested").change(function()
{
    var date = $("#date-requested").val();
    var period = $("#period").val();

    getPasses(date, period);
});

$("#period").change(function()
{
    var date = $("#date-requested").val();
    var period = $("#period").val();

    getPasses(date, period);
});