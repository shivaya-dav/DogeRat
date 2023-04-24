package willi.fiend.Ui.Screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.End
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import willi.fiend.Ui.AppFont
import willi.fiend.R

@Composable
fun Page1(onNext: () -> Unit) {
    val scope = rememberCoroutineScope()
    Column(modifier = Modifier.fillMaxSize()) {
        Image(
            modifier = Modifier
                .fillMaxWidth()
                .weight(4f),
            painter = painterResource(id = R.drawable.header),
            contentDescription = null,
            contentScale = ContentScale.Crop
        )
        Text(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.6f)
                .padding(top = 30.dp, start = 15.dp, end = 15.dp),
            text = "Welcome to Inspector",
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
            text = "Him boisterous invitation dispatched had connection inhabiting projection. By mutual an mr danger garret edward an. Diverted as strictly exertion addition no disposal by stanhill.",
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
                scope.launch {
                    onNext()
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
                    text = "Next",
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