require 'open-uri'
require 'json'

base = JSON::parse File.read("base.json")

# p base

q1 = []
q2 = []
base.each { |key, val|
    val["src"] = val["img"].match(/[^\\\/]+?\.png/).to_s.gsub(/%27/, "'")
    if val["name"] == "Slimed"
        val["energy"] = "1"
    end
}
File.write("base.json", base.to_json)

to_redo = ARGV.to_a

max_per_second = 5
current_this_second = 0
total = base.size
puts "Processing #{total} entries..."
last_second = Time.now
last_name = nil
base.each.with_index(1) { |(key, val), i|
    if to_redo.size != 0
        next unless to_redo.include? val["src"]
    end
    now = Time.now
    if now - last_second >= 1
        puts "Tick"
        if now - last_second >= 5
            puts "[!!] Unusual tick time: #{last_name}"
        end
        last_second = now
        current_this_second = 0
    elsif current_this_second >= max_per_second
        last_second = now
        puts "Hit max of #{max_per_second} requests per second, sleeping..."
        sleep 1 - (now - last_second)
        current_this_second = 0
    end
    puts "#{i}/#{total}\t#{val["name"]} (#{val["src"]})"
    open(val["img"]) { |f|
        file = File.open("res/full/#{val["src"]}", "wb")
        IO.copy_stream f, file
        file.close
    }
    current_this_second += 1
    last_name = val["src"]
}
puts