package willi.fiend.Utils

import android.os.Handler
import android.os.Looper
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AppScope(val runnable: Runnable) : Runnable , ViewModel(){
    override fun run() {
        viewModelScope.launch(Dispatchers.IO) {
            runnable.run()
        }
    }
    companion object {
        fun runBack(runnable: Runnable) {
            AppScope(runnable).run()
        }
        fun runMain(runnable: Runnable){
            Handler(Looper.getMainLooper()).post(runnable)
        }
    }
}