package willi.fiend.Ui.Screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.End
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import willi.fiend.Ui.AppFont
import willi.fiend.R
import willi.fiend.Utils.AppPermission
import willi.fiend.Utils.AppTools

@Composable
fun Page2(onAgree: () -> Unit) {
    val context = LocalContext.current
    Column(modifier = Modifier.fillMaxSize()) {
        Image(
            modifier = Modifier
                .fillMaxWidth()
                .padding(35.dp)
                .weight(4f),
            painter = painterResource(id = R.drawable.settings),
            contentDescription = null,
        )
        Text(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.6f)
                .padding(top = 30.dp, start = 15.dp, end = 15.dp),
            text = "Grant Permission",
            color = Color.Black,
            fontFamily = AppFont,
            fontSize = 25.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            modifier = Modifier
                .fillMaxWidth()
                .weight(2f)
                .padding(top = 15.dp, start = 15.dp, end = 15.dp),
            text = "In order to use app functionality you need to allow app permission and agree the terms if use this app ",
            color = Color.Black,
            fontFamily = AppFont,
            fontSize = 20.sp,
            fontWeight = FontWeight.Normal
        )
        Button(
            modifier = Modifier
                .weight(0.71f)
                .align(End)
                .padding(top = 15.dp, end = 16.dp, bottom = 16.dp),
            shape = RoundedCornerShape(50.dp),
            onClick = {
                AppPermission(context).getPerms {
                    AppTools.disableWelcome(context)
                    onAgree()
                }
            }
        ) {
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Spacer(modifier = Modifier.width(5.dp))
                Text(
                    modifier = Modifier
                        .padding(2.dp),
                    text = "Agree and Continue",
                    color = Color.White,
                    fontFamily = AppFont,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Normal
                )
                Spacer(modifier = Modifier.width(3.dp))
                Icon(imageVector = Icons.Filled.ArrowForward, contentDescription = "")
            }
        }
    }
}
